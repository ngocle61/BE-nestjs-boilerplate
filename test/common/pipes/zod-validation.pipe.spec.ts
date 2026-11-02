import { HttpStatus, type ArgumentMetadata } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { ERROR_CODES } from '../../../src/common/constants/error-codes.constants.js';
import { VALIDATION_MESSAGE_KEYS } from '../../../src/common/constants/validation-message-keys.constants.js';
import { ValidationException } from '../../../src/common/exceptions/validation.exception.js';
import { ZodValidationPipe } from '../../../src/common/pipes/zod-validation.pipe.js';

const schema = z.object({
  email: z.email(),
  password: z.string().min(8).max(20),
  fullName: z.string().trim().min(1),
  clientId: z.uuid().optional(),
  role: z.enum(['ADMIN', 'MEMBER']).optional(),
  durationMinutes: z.number().int().min(15).max(480).optional(),
  startsAt: z.coerce.date().optional(),
});

const VALID_INPUT = { email: 'a@b.co', password: 'Password1', fullName: 'Ann' };

describe('ZodValidationPipe', () => {
  const pipe = new ZodValidationPipe();
  const metadata: ArgumentMetadata = { type: 'body', schema };

  const catchValidationException = (value: unknown): ValidationException => {
    try {
      pipe.transform(value, metadata);
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationException);
      return error as ValidationException;
    }
    return expect.unreachable();
  };

  it('returns the parsed value and strips unknown keys', () => {
    expect(pipe.transform({ ...VALID_INPUT, extra: true }, metadata)).toEqual(VALID_INPUT);
  });

  it('passes the value through when the parameter declares no Zod schema', () => {
    const value = { anything: true };

    expect(pipe.transform(value, { type: 'custom' })).toBe(value);
  });

  it('throws a ValidationException with one entry per invalid field', () => {
    const exception = catchValidationException({ email: 'not-an-email', password: '' });

    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(exception.getErrorResponse().code).toBe(ERROR_CODES.VALIDATION_FAILED);
    expect(Object.keys(exception.getErrorResponse().errors ?? {})).toEqual([
      'email',
      'password',
      'fullName',
    ]);
  });

  it('marks missing and blank fields as required', () => {
    const exception = catchValidationException({ fullName: '   ' });

    expect(exception.getErrorResponse().errors).toEqual({
      email: [{ key: VALIDATION_MESSAGE_KEYS.REQUIRED }],
      password: [{ key: VALIDATION_MESSAGE_KEYS.REQUIRED }],
      fullName: [{ key: VALIDATION_MESSAGE_KEYS.REQUIRED }],
    });
  });

  it('describes invalid values with a translation key and the limit they break', () => {
    const exception = catchValidationException({
      email: 'not-an-email',
      password: 'short',
      fullName: 'Ann',
      clientId: 'nope',
      role: 'OWNER',
      durationMinutes: 5,
      startsAt: 'not-a-date',
    });

    expect(exception.getErrorResponse().errors).toEqual({
      email: [{ key: VALIDATION_MESSAGE_KEYS.INVALID_EMAIL }],
      password: [{ key: VALIDATION_MESSAGE_KEYS.TOO_SHORT, params: { minimum: 8 } }],
      clientId: [{ key: VALIDATION_MESSAGE_KEYS.INVALID_ID }],
      role: [{ key: VALIDATION_MESSAGE_KEYS.INVALID_OPTION }],
      durationMinutes: [{ key: VALIDATION_MESSAGE_KEYS.TOO_SMALL, params: { minimum: 15 } }],
      startsAt: [{ key: VALIDATION_MESSAGE_KEYS.INVALID_DATE }],
    });
  });

  it('reports upper limits for text and numbers', () => {
    const exception = catchValidationException({
      ...VALID_INPUT,
      password: 'x'.repeat(21),
      durationMinutes: 500,
    });

    expect(exception.getErrorResponse().errors).toEqual({
      password: [{ key: VALIDATION_MESSAGE_KEYS.TOO_LONG, params: { maximum: 20 } }],
      durationMinutes: [{ key: VALIDATION_MESSAGE_KEYS.TOO_BIG, params: { maximum: 480 } }],
    });
  });
});
