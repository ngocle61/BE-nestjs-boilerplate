import { HttpStatus, RequestMethod } from '@nestjs/common';
import {
  HTTP_CODE_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
  SSE_METADATA,
} from '@nestjs/common/constants.js';
import { Test } from '@nestjs/testing';
import { EMPTY } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';

import { CHAT_STREAM_PATH } from '../../src/chat/chat.constants.js';
import { ChatController } from '../../src/chat/chat.controller.js';
import { ChatService } from '../../src/chat/chat.service.js';
import type { ConversationResponseDto } from '../../src/chat/dto/conversation-response.dto.js';
import { Role } from '../../src/generated/prisma/enums.js';

const CURRENT_USER = { id: 'user-1', role: Role.MEMBER, permissions: [] };

const createController = async (chatService: Partial<ChatService>) => {
  const moduleRef = await Test.createTestingModule({
    controllers: [ChatController],
    providers: [{ provide: ChatService, useValue: chatService }],
  }).compile();

  return moduleRef.get(ChatController);
};

describe('ChatController', () => {
  it('fetches the conversation for the current user', async () => {
    const conversation: ConversationResponseDto = {
      id: 'conversation-1',
      interventionId: null,
      messages: [],
    };
    const getConversation = vi.fn().mockResolvedValue(conversation);
    const controller = await createController({ getConversation });

    await expect(controller.getConversation({}, CURRENT_USER)).resolves.toEqual(conversation);
    expect(getConversation).toHaveBeenCalledWith(CURRENT_USER.id, undefined);
  });

  it('streams a reply on behalf of the current user', async () => {
    const streamMessage = vi.fn().mockResolvedValue(EMPTY);
    const controller = await createController({ streamMessage });
    const dto = { content: 'Hi' };
    const signal = new AbortController().signal;

    await expect(controller.streamMessage(dto, CURRENT_USER, signal)).resolves.toBe(EMPTY);
    expect(streamMessage).toHaveBeenCalledWith(CURRENT_USER.id, dto, signal);
  });

  it('registers the stream as a POST server-sent-events route', () => {
    const handler = ChatController.prototype.streamMessage;

    expect(Reflect.getMetadata(SSE_METADATA, handler)).toBe(true);
    expect(Reflect.getMetadata(METHOD_METADATA, handler)).toBe(RequestMethod.POST);
    expect(Reflect.getMetadata(PATH_METADATA, handler)).toBe(CHAT_STREAM_PATH);
    expect(Reflect.getMetadata(HTTP_CODE_METADATA, handler)).toBe(HttpStatus.OK);
  });
});
