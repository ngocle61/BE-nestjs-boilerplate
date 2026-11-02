import { HttpStatus } from '@nestjs/common';

import { ERROR_CODES, ERROR_MESSAGE_KEYS } from '../constants/error-codes.constants.js';
import type { ValidationIssue } from '../dto/error-response.dto.js';
import { ApiException } from './api.exception.js';

export class ValidationException extends ApiException {
  constructor(errors: Record<string, ValidationIssue[]>) {
    super(
      HttpStatus.BAD_REQUEST,
      ERROR_CODES.VALIDATION_FAILED,
      ERROR_MESSAGE_KEYS.VALIDATION_FAILED,
      errors,
    );
  }
}
