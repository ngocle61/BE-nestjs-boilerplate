import { HttpStatus } from '@nestjs/common';

import { ERROR_CODES, ERROR_MESSAGE_KEYS } from '../../common/constants/error-codes.constants.js';
import { ApiException } from '../../common/exceptions/api.exception.js';

export class UserEmailTakenException extends ApiException {
  constructor() {
    super(
      HttpStatus.CONFLICT,
      ERROR_CODES.EMAIL_ALREADY_IN_USE,
      ERROR_MESSAGE_KEYS.EMAIL_ALREADY_IN_USE,
    );
  }
}
