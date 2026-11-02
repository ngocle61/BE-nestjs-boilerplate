import { Injectable, Logger, NotFoundException, type MessageEvent } from '@nestjs/common';
import { EMPTY, Observable, type Subscriber } from 'rxjs';

import { ERROR_MESSAGE_KEYS } from '../common/constants/error-codes.constants.js';
import type { Message } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CHAT_STREAM_EVENTS, MAX_HISTORY_MESSAGES } from './chat.constants.js';
import { toMessageResponse, toStreamError } from './chat.mapper.js';
import type { ConversationResponseDto } from './dto/conversation-response.dto.js';
import type { SendMessageDto } from './dto/send-message.dto.js';
import type { StreamDeltaDto, StreamDoneDto, StreamStartDto } from './dto/stream-event.dto.js';
import { AiServiceUnavailableException } from './exceptions/ai-service-unavailable.exception.js';
import type { ChatTurn } from './interfaces/chat-turn.interface.js';
import { OpenaiService } from './openai.service.js';

interface ReplyStream {
  conversationId: string;
  userMessage: Message;
  turns: ChatTurn[];
  context?: string;
  signal: AbortSignal;
  subscriber: Subscriber<MessageEvent>;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly openai: OpenaiService,
  ) {}

  async getConversation(userId: string, interventionId?: string): Promise<ConversationResponseDto> {
    if (interventionId) await this.assertInterventionExists(interventionId);

    const conversation = await this.getOrCreateConversation(userId, interventionId);
    const messages = await this.prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
    });

    return {
      id: conversation.id,
      interventionId: conversation.interventionId,
      messages: messages.map(toMessageResponse),
    };
  }

  async streamMessage(
    userId: string,
    dto: SendMessageDto,
    signal: AbortSignal,
  ): Promise<Observable<MessageEvent>> {
    this.openai.assertConfigured();
    if (dto.interventionId) await this.assertInterventionExists(dto.interventionId);

    const conversation = await this.getOrCreateConversation(userId, dto.interventionId);
    const userMessage = await this.prisma.message.create({
      data: { conversationId: conversation.id, senderId: userId, body: dto.content },
    });

    if (signal.aborted) return EMPTY;

    const turns = await this.buildHistory(conversation.id);
    const context = dto.interventionId
      ? await this.buildInterventionContext(dto.interventionId)
      : undefined;

    return new Observable<MessageEvent>((subscriber) => {
      void this.emitReply({
        conversationId: conversation.id,
        userMessage,
        turns,
        context,
        signal,
        subscriber,
      });
    });
  }

  private async emitReply(stream: ReplyStream): Promise<void> {
    try {
      await this.runReply(stream);
    } catch (error) {
      this.logger.error(error instanceof Error ? error.stack : error);
      stream.subscriber.next({
        type: CHAT_STREAM_EVENTS.ERROR,
        data: toStreamError(error),
      });
      stream.subscriber.complete();
    }
  }

  private async runReply({
    conversationId,
    userMessage,
    turns,
    context,
    signal,
    subscriber,
  }: ReplyStream): Promise<void> {
    subscriber.next({
      type: CHAT_STREAM_EVENTS.START,
      data: {
        conversationId,
        userMessage: toMessageResponse(userMessage),
      } satisfies StreamStartDto,
    });

    let body = '';

    try {
      for await (const delta of this.openai.streamReply(turns, context, signal)) {
        body += delta;
        subscriber.next({
          type: CHAT_STREAM_EVENTS.DELTA,
          data: { text: delta } satisfies StreamDeltaDto,
        });
      }
    } catch (error) {
      await this.saveAssistantMessage(conversationId, body);
      subscriber.next({ type: CHAT_STREAM_EVENTS.ERROR, data: toStreamError(error) });
      subscriber.complete();
      return;
    }

    const assistantMessage = await this.saveAssistantMessage(conversationId, body);

    if (!assistantMessage) {
      subscriber.next({
        type: CHAT_STREAM_EVENTS.ERROR,
        data: toStreamError(new AiServiceUnavailableException()),
      });
      subscriber.complete();
      return;
    }

    subscriber.next({
      type: CHAT_STREAM_EVENTS.DONE,
      data: { assistantMessage: toMessageResponse(assistantMessage) } satisfies StreamDoneDto,
    });
    subscriber.complete();
  }

  private async saveAssistantMessage(
    conversationId: string,
    body: string,
  ): Promise<Message | null> {
    if (!body) return null;

    const assistantMessage = await this.prisma.message.create({
      data: { conversationId, senderId: null, body },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: assistantMessage.createdAt },
    });

    return assistantMessage;
  }

  private async buildHistory(conversationId: string): Promise<ChatTurn[]> {
    const history = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: MAX_HISTORY_MESSAGES,
    });

    return history.reverse().map((message): ChatTurn => ({
      role: message.senderId ? 'user' : 'assistant',
      content: message.body,
    }));
  }

  private async getOrCreateConversation(userId: string, interventionId?: string) {
    const existing = await this.prisma.conversation.findFirst({
      where: { interventionId: interventionId ?? null, members: { some: { userId } } },
    });
    if (existing) return existing;

    return this.prisma.conversation.create({
      data: {
        interventionId: interventionId ?? null,
        members: { create: { userId } },
      },
    });
  }

  private async assertInterventionExists(interventionId: string): Promise<void> {
    const exists = await this.prisma.intervention.findUnique({
      where: { id: interventionId },
      select: { id: true },
    });
    if (!exists) throw new NotFoundException(ERROR_MESSAGE_KEYS.INTERVENTION_NOT_FOUND);
  }

  private async buildInterventionContext(interventionId: string): Promise<string> {
    const intervention = await this.prisma.intervention.findUnique({
      where: { id: interventionId },
      include: { client: true, technician: true },
    });
    if (!intervention) return '';

    const parts = [
      `Type: ${intervention.type}`,
      `Status: ${intervention.status}`,
      `Client: ${intervention.client.name}`,
      intervention.startsAt
        ? `Scheduled at: ${intervention.startsAt.toISOString()}`
        : 'Not yet scheduled',
      `Duration: ${intervention.durationMinutes} minutes`,
      intervention.technician
        ? `Technician: ${intervention.technician.fullName}`
        : 'No technician assigned',
      intervention.notes ? `Notes: ${intervention.notes}` : undefined,
    ];

    return parts.filter(Boolean).join('\n');
  }
}
