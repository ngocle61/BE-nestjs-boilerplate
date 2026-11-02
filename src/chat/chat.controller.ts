import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  RequestMethod,
  Sse,
  SseSignal,
} from '@nestjs/common';
import type { MessageEvent } from '@nestjs/common';
import { METHOD_METADATA } from '@nestjs/common/constants.js';
import { ApiBearerAuth, ApiDefaultResponse, ApiOkResponse, ApiProduces } from '@nestjs/swagger';
import type { Observable } from 'rxjs';

import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
import { PERMISSIONS } from '../auth/permissions/permissions.constants.js';
import { errorResponseSchema } from '../common/dto/error-response.dto.js';
import { CHAT_STREAM_PATH, EVENT_STREAM_CONTENT_TYPE } from './chat.constants.js';
import { ChatService } from './chat.service.js';
import {
  conversationQuerySchema,
  type ConversationQueryDto,
} from './dto/conversation-query.dto.js';
import {
  conversationResponseSchema,
  type ConversationResponseDto,
} from './dto/conversation-response.dto.js';
import { sendMessageSchema, type SendMessageDto } from './dto/send-message.dto.js';
import { streamEventDataSchema } from './dto/stream-event.dto.js';

@ApiBearerAuth()
@ApiDefaultResponse({ standardSchema: errorResponseSchema })
@Controller('chat')
@RequirePermissions(PERMISSIONS.CHAT_USE)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversation')
  @ApiOkResponse({ standardSchema: conversationResponseSchema })
  getConversation(
    @Query({ schema: conversationQuerySchema }) query: ConversationQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ConversationResponseDto> {
    return this.chatService.getConversation(user.id, query.interventionId);
  }

  @Sse(CHAT_STREAM_PATH, { [METHOD_METADATA]: RequestMethod.POST })
  @HttpCode(HttpStatus.OK)
  @ApiProduces(EVENT_STREAM_CONTENT_TYPE)
  @ApiOkResponse({ standardSchema: streamEventDataSchema })
  streamMessage(
    @Body({ schema: sendMessageSchema }) dto: SendMessageDto,
    @CurrentUser() user: AuthenticatedUser,
    @SseSignal() signal: AbortSignal,
  ): Promise<Observable<MessageEvent>> {
    return this.chatService.streamMessage(user.id, dto, signal);
  }
}
