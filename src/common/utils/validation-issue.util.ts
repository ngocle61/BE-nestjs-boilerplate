import type { z } from 'zod';

import {
  STRING_FORMAT_MESSAGE_KEYS,
  VALIDATION_MESSAGE_KEYS,
} from '../constants/validation-message-keys.constants.js';
import type { ValidationIssue } from '../dto/error-response.dto.js';

const STRING_ORIGIN = 'string';
const REQUIRED_STRING_LENGTH = 1;

const toInvalidTypeIssue = ({ input, expected }: z.core.$ZodIssueInvalidType): ValidationIssue => {
  if (input === undefined || input === null) return { key: VALIDATION_MESSAGE_KEYS.REQUIRED };
  if (expected === 'date') return { key: VALIDATION_MESSAGE_KEYS.INVALID_DATE };
  return { key: VALIDATION_MESSAGE_KEYS.INVALID_TYPE };
};

const toTooSmallIssue = ({ origin, minimum }: z.core.$ZodIssueTooSmall): ValidationIssue => {
  const limit = Number(minimum);
  if (origin !== STRING_ORIGIN) {
    return { key: VALIDATION_MESSAGE_KEYS.TOO_SMALL, params: { minimum: limit } };
  }
  if (limit <= REQUIRED_STRING_LENGTH) return { key: VALIDATION_MESSAGE_KEYS.REQUIRED };
  return { key: VALIDATION_MESSAGE_KEYS.TOO_SHORT, params: { minimum: limit } };
};

const toTooBigIssue = ({ origin, maximum }: z.core.$ZodIssueTooBig): ValidationIssue => ({
  key:
    origin === STRING_ORIGIN ? VALIDATION_MESSAGE_KEYS.TOO_LONG : VALIDATION_MESSAGE_KEYS.TOO_BIG,
  params: { maximum: Number(maximum) },
});

export const toValidationIssue = (issue: z.core.$ZodIssue): ValidationIssue => {
  switch (issue.code) {
    case 'invalid_type':
      return toInvalidTypeIssue(issue);
    case 'too_small':
      return toTooSmallIssue(issue);
    case 'too_big':
      return toTooBigIssue(issue);
    case 'invalid_format':
      return {
        key: STRING_FORMAT_MESSAGE_KEYS[issue.format] ?? VALIDATION_MESSAGE_KEYS.INVALID_FORMAT,
      };
    case 'invalid_value':
      return { key: VALIDATION_MESSAGE_KEYS.INVALID_OPTION };
    default:
      return { key: VALIDATION_MESSAGE_KEYS.INVALID };
  }
};
