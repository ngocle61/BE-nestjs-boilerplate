import { HttpStatus } from '@nestjs/common';

import { ERROR_CODES, ERROR_MESSAGE_KEYS } from '../../common/constants/error-codes.constants.js';
import { ApiException } from '../../common/exceptions/api.exception.js';

export class InvalidRefreshTokenException extends ApiException {
  constructor() {
    super(
      HttpStatus.UNAUTHORIZED,
      ERROR_CODES.INVALID_REFRESH_TOKEN,
      ERROR_MESSAGE_KEYS.INVALID_REFRESH_TOKEN,
    );
  }
}
