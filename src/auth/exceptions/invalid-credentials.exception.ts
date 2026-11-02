import { HttpStatus } from '@nestjs/common';

import { ERROR_CODES, ERROR_MESSAGE_KEYS } from '../../common/constants/error-codes.constants.js';
import { ApiException } from '../../common/exceptions/api.exception.js';

export class InvalidCredentialsException extends ApiException {
  constructor() {
    super(
      HttpStatus.UNAUTHORIZED,
      ERROR_CODES.INVALID_CREDENTIALS,
      ERROR_MESSAGE_KEYS.INVALID_CREDENTIALS,
    );
  }
}
