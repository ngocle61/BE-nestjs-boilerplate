import { HttpStatus } from '@nestjs/common';

import { ERROR_CODES, ERROR_MESSAGE_KEYS } from '../../common/constants/error-codes.constants.js';
import { ApiException } from '../../common/exceptions/api.exception.js';

export class AiServiceUnavailableException extends ApiException {
  constructor() {
    super(
      HttpStatus.SERVICE_UNAVAILABLE,
      ERROR_CODES.AI_SERVICE_UNAVAILABLE,
      ERROR_MESSAGE_KEYS.AI_SERVICE_UNAVAILABLE,
    );
  }
}
