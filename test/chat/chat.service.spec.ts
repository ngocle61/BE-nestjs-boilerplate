import type { MessageEvent } from '@nestjs/common';
import { lastValueFrom, toArray, type Observable } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CHAT_STREAM_EVENTS } from '../../src/chat/chat.constants.js';
import { ChatService } from '../../src/chat/chat.service.js';
import { AiServiceUnavailableException } from '../../src/chat/exceptions/ai-service-unavailable.exception.js';
import type { OpenaiService } from '../../src/chat/openai.service.js';
import {
  ERROR_CODES,
  ERROR_MESSAGE_KEYS,
} from '../../src/common/constants/error-codes.constants.js';
import type { PrismaService } from '../../src/prisma/prisma.service.js';

const CONVERSATION = { id: 'conversation-1', interventionId: null };
const CREATED_AT = new Date('2026-01-01T00:00:00.000Z');
const USER_MESSAGE = {
  id: 'message-1',
  conversationId: CONVERSATION.id,
  senderId: 'user-1',
  body: 'Hi',
  createdAt: CREATED_AT,
};
const ASSISTANT_MESSAGE = {
  id: 'message-2',
  conversationId: CONVERSATION.id,
  senderId: null,
  body: 'Xin chào',
  createdAt: CREATED_AT,
};

const DTO = { content: 'Hi' };

const createPrisma = () => ({
  conversation: {
    findFirst: vi.fn().mockResolvedValue(CONVERSATION),
    create: vi.fn().mockResolvedValue(CONVERSATION),
    update: vi.fn().mockResolvedValue(CONVERSATION),
  },
  message: {
    create: vi.fn().mockResolvedValueOnce(USER_MESSAGE).mockResolvedValue(ASSISTANT_MESSAGE),
    findMany: vi.fn().mockResolvedValue([USER_MESSAGE]),
  },
  intervention: { findUnique: vi.fn() },
});

const deltasOf = (deltas: string[], failure?: Error) =>
  async function* stream() {
    for (const delta of deltas) yield delta;
    if (failure) throw failure;
  };

const collect = (observable: Observable<MessageEvent>) => lastValueFrom(observable.pipe(toArray()));

const typesOf = (events: MessageEvent[]) => events.map((event) => event.type);

describe('ChatService.streamMessage', () => {
  let prisma: ReturnType<typeof createPrisma>;
  let openai: { assertConfigured: ReturnType<typeof vi.fn>; streamReply: ReturnType<typeof vi.fn> };
  let service: ChatService;

  beforeEach(() => {
    prisma = createPrisma();
    openai = { assertConfigured: vi.fn(), streamReply: vi.fn() };
    service = new ChatService(
      prisma as unknown as PrismaService,
      openai as unknown as OpenaiService,
    );
  });

  it('announces the stored user message, streams deltas, then completes with the saved reply', async () => {
    openai.streamReply.mockImplementation(deltasOf(['Xin', ' chào']));

    const events = await collect(
      await service.streamMessage('user-1', DTO, new AbortController().signal),
    );

    expect(typesOf(events)).toEqual([
      CHAT_STREAM_EVENTS.START,
      CHAT_STREAM_EVENTS.DELTA,
      CHAT_STREAM_EVENTS.DELTA,
      CHAT_STREAM_EVENTS.DONE,
    ]);
    expect(events[0]?.data).toEqual({
      conversationId: CONVERSATION.id,
      userMessage: { id: 'message-1', body: 'Hi', isAssistant: false, createdAt: CREATED_AT },
    });
    expect(events[1]?.data).toEqual({ text: 'Xin' });
    expect(events[3]?.data).toEqual({
      assistantMessage: {
        id: 'message-2',
        body: 'Xin chào',
        isAssistant: true,
        createdAt: CREATED_AT,
      },
    });
    expect(prisma.message.create.mock.lastCall?.[0]).toEqual({
      data: { conversationId: CONVERSATION.id, senderId: null, body: 'Xin chào' },
    });
    expect(prisma.conversation.update).toHaveBeenCalledWith({
      where: { id: CONVERSATION.id },
      data: { lastMessageAt: CREATED_AT },
    });
  });

  it('keeps the text generated so far when the provider fails midway', async () => {
    openai.streamReply.mockImplementation(deltasOf(['Nửa c'], new AiServiceUnavailableException()));

    const events = await collect(
      await service.streamMessage('user-1', DTO, new AbortController().signal),
    );

    expect(typesOf(events)).toEqual([
      CHAT_STREAM_EVENTS.START,
      CHAT_STREAM_EVENTS.DELTA,
      CHAT_STREAM_EVENTS.ERROR,
    ]);
    expect(events[2]?.data).toEqual({
      code: ERROR_CODES.AI_SERVICE_UNAVAILABLE,
      message: ERROR_MESSAGE_KEYS.AI_SERVICE_UNAVAILABLE,
    });
    expect(prisma.message.create.mock.lastCall?.[0]).toEqual({
      data: { conversationId: CONVERSATION.id, senderId: null, body: 'Nửa c' },
    });
  });

  it('reports an outage and stores nothing when the provider returns no text', async () => {
    openai.streamReply.mockImplementation(deltasOf([]));

    const events = await collect(
      await service.streamMessage('user-1', DTO, new AbortController().signal),
    );

    expect(typesOf(events)).toEqual([CHAT_STREAM_EVENTS.START, CHAT_STREAM_EVENTS.ERROR]);
    expect(prisma.message.create).toHaveBeenCalledTimes(1);
    expect(prisma.conversation.update).not.toHaveBeenCalled();
  });

  it('stores the user message but skips generation when the client already left', async () => {
    const controller = new AbortController();
    controller.abort();

    const events = await collect(await service.streamMessage('user-1', DTO, controller.signal));

    expect(events).toEqual([]);
    expect(prisma.message.create).toHaveBeenCalledTimes(1);
    expect(openai.streamReply).not.toHaveBeenCalled();
  });

  it('reports an error instead of crashing when the database dies mid-stream', async () => {
    openai.streamReply.mockImplementation(deltasOf(['Xin', ' chào']));
    prisma.message.create
      .mockReset()
      .mockResolvedValueOnce(USER_MESSAGE)
      .mockRejectedValue(new Error("Can't reach database server"));

    const events = await collect(
      await service.streamMessage('user-1', DTO, new AbortController().signal),
    );

    expect(typesOf(events).at(-1)).toBe(CHAT_STREAM_EVENTS.ERROR);
    expect(events.at(-1)?.data).toEqual({
      code: ERROR_CODES.AI_SERVICE_UNAVAILABLE,
      message: ERROR_MESSAGE_KEYS.AI_SERVICE_UNAVAILABLE,
    });
  });

  it('surfaces a database failure during setup as a rejection the filter can handle', async () => {
    const outage = new Error("Can't reach database server");
    prisma.conversation.findFirst.mockRejectedValue(outage);

    await expect(service.streamMessage('user-1', DTO, new AbortController().signal)).rejects.toBe(
      outage,
    );
    expect(openai.streamReply).not.toHaveBeenCalled();
  });

  it('refuses before opening the stream when the AI provider is not configured', async () => {
    openai.assertConfigured.mockImplementation(() => {
      throw new AiServiceUnavailableException();
    });

    await expect(
      service.streamMessage('user-1', DTO, new AbortController().signal),
    ).rejects.toBeInstanceOf(AiServiceUnavailableException);
    expect(prisma.message.create).not.toHaveBeenCalled();
  });
});
