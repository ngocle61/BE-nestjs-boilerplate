import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';

import {
  ERROR_CODES,
  ERROR_MESSAGE_KEYS,
  HTTP_STATUS_ERROR_CODES,
  HTTP_STATUS_ERROR_MESSAGE_KEYS,
  type ErrorMessageKey,
} from '../constants/error-codes.constants.js';
import { ApiException } from '../exceptions/api.exception.js';
import type { ErrorResponse } from '../dto/error-response.dto.js';

const KNOWN_MESSAGE_KEYS = new Set<string>(Object.values(ERROR_MESSAGE_KEYS));

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception instanceof Error ? exception.stack : exception);
    }

    const response = host.switchToHttp().getResponse<Response>();

    if (response.headersSent) return;

    response.status(status).json(this.toErrorResponse(exception, status));
  }

  private toErrorResponse(exception: unknown, status: number): ErrorResponse {
    if (exception instanceof ApiException) return exception.getErrorResponse();

    if (exception instanceof HttpException && status < HttpStatus.INTERNAL_SERVER_ERROR) {
      return {
        code: HTTP_STATUS_ERROR_CODES[status] ?? ERROR_CODES.HTTP_ERROR,
        message: this.toMessageKey(exception.message, status),
      };
    }

    return { code: ERROR_CODES.INTERNAL, message: ERROR_MESSAGE_KEYS.INTERNAL };
  }

  private toMessageKey(message: string, status: number): ErrorMessageKey {
    if (this.isMessageKey(message)) return message;
    return HTTP_STATUS_ERROR_MESSAGE_KEYS[status] ?? ERROR_MESSAGE_KEYS.REQUEST_FAILED;
  }

  private isMessageKey(message: string): message is ErrorMessageKey {
    return KNOWN_MESSAGE_KEYS.has(message);
  }
}
