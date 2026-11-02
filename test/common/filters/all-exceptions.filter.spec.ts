import {
  HttpStatus,
  Logger,
  NotFoundException,
  UnauthorizedException,
  type ArgumentsHost,
} from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

import {
  ERROR_CODES,
  ERROR_MESSAGE_KEYS,
} from '../../../src/common/constants/error-codes.constants.js';
import { VALIDATION_MESSAGE_KEYS } from '../../../src/common/constants/validation-message-keys.constants.js';
import { ValidationException } from '../../../src/common/exceptions/validation.exception.js';
import { AllExceptionsFilter } from '../../../src/common/filters/all-exceptions.filter.js';

const createHost = (headersSent = false) => {
  const response = { status: vi.fn(), json: vi.fn(), headersSent };
  response.status.mockReturnValue(response);
  const host = {
    switchToHttp: () => ({ getResponse: () => response }),
  } as unknown as ArgumentsHost;
  return { host, response };
};

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();

  it('leaves a response alone once its headers are already on the wire', () => {
    const logError = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    const { host, response } = createHost(true);

    filter.catch(new Error("Can't reach database server"), host);

    expect(response.status).not.toHaveBeenCalled();
    expect(response.json).not.toHaveBeenCalled();
    expect(logError).toHaveBeenCalled();
  });

  it('keeps the body of API exceptions', () => {
    const { host, response } = createHost();
    const errors = { email: [{ key: VALIDATION_MESSAGE_KEYS.INVALID_EMAIL }] };

    filter.catch(new ValidationException(errors), host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith({
      code: ERROR_CODES.VALIDATION_FAILED,
      message: ERROR_MESSAGE_KEYS.VALIDATION_FAILED,
      errors,
    });
  });

  it('maps built-in HTTP exceptions to a stable code and keeps their message key', () => {
    const { host, response } = createHost();

    filter.catch(new UnauthorizedException(ERROR_MESSAGE_KEYS.UNAUTHORIZED), host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(response.json).toHaveBeenCalledWith({
      code: ERROR_CODES.UNAUTHORIZED,
      message: ERROR_MESSAGE_KEYS.UNAUTHORIZED,
    });
  });

  it('replaces a message that is not a translation key with the key for its status', () => {
    const { host, response } = createHost();

    filter.catch(new NotFoundException(), host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(response.json).toHaveBeenCalledWith({
      code: ERROR_CODES.NOT_FOUND,
      message: ERROR_MESSAGE_KEYS.NOT_FOUND,
    });
  });

  it('hides unexpected errors behind a generic message key', () => {
    const { host, response } = createHost();
    const logError = vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    filter.catch(new Error('database exploded'), host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(response.json).toHaveBeenCalledWith({
      code: ERROR_CODES.INTERNAL,
      message: ERROR_MESSAGE_KEYS.INTERNAL,
    });
    expect(logError).toHaveBeenCalled();
  });
});
