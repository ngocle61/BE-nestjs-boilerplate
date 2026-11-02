import { ERROR_CODES, ERROR_MESSAGE_KEYS } from '../common/constants/error-codes.constants.js';
import { ApiException } from '../common/exceptions/api.exception.js';
import type { ErrorResponse } from '../common/dto/error-response.dto.js';
import type { Message } from '../generated/prisma/client.js';
import type { MessageResponseDto } from './dto/message-response.dto.js';

export const toMessageResponse = (message: Message): MessageResponseDto => ({
  id: message.id,
  body: message.body,
  isAssistant: message.senderId === null,
  createdAt: message.createdAt,
});

export const toStreamError = (error: unknown): ErrorResponse => {
  if (error instanceof ApiException) return error.getErrorResponse();

  return {
    code: ERROR_CODES.AI_SERVICE_UNAVAILABLE,
    message: ERROR_MESSAGE_KEYS.AI_SERVICE_UNAVAILABLE,
  };
};
