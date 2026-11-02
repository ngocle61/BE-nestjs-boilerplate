import { HttpException, type HttpStatus } from '@nestjs/common';

import type { ErrorMessageKey } from '../constants/error-codes.constants.js';
import type { ErrorResponse, ValidationIssue } from '../dto/error-response.dto.js';

export class ApiException extends HttpException {
  constructor(
    status: HttpStatus,
    code: string,
    message: ErrorMessageKey,
    errors?: Record<string, ValidationIssue[]>,
  ) {
    super({ code, message, ...(errors && { errors }) } satisfies ErrorResponse, status);
  }

  getErrorResponse(): ErrorResponse {
    return this.getResponse() as ErrorResponse;
  }
}
