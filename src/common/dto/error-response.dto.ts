import { z } from 'zod';

import { ERROR_MESSAGE_KEYS } from '../constants/error-codes.constants.js';
import { VALIDATION_MESSAGE_KEYS } from '../constants/validation-message-keys.constants.js';

export const validationIssueSchema = z
  .object({
    key: z.enum(VALIDATION_MESSAGE_KEYS),
    params: z.record(z.string(), z.number()).optional(),
  })
  .meta({ id: 'ValidationIssue' });

export const errorResponseSchema = z
  .object({
    code: z.string(),
    message: z.enum(ERROR_MESSAGE_KEYS),
    errors: z.record(z.string(), z.array(validationIssueSchema)).optional(),
  })
  .meta({ id: 'ErrorResponse' });

export type ValidationIssue = z.infer<typeof validationIssueSchema>;

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
