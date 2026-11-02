import { z } from 'zod';

import { errorResponseSchema } from '../../common/dto/error-response.dto.js';
import { messageResponseSchema } from './message-response.dto.js';

export const streamStartSchema = z
  .object({
    conversationId: z.string(),
    userMessage: messageResponseSchema,
  })
  .meta({ id: 'StreamStart' });

export const streamDeltaSchema = z
  .object({
    text: z.string(),
  })
  .meta({ id: 'StreamDelta' });

export const streamDoneSchema = z
  .object({
    assistantMessage: messageResponseSchema,
  })
  .meta({ id: 'StreamDone' });

export const streamEventDataSchema = z.union([
  streamStartSchema,
  streamDeltaSchema,
  streamDoneSchema,
  errorResponseSchema,
]);

export type StreamStartDto = z.infer<typeof streamStartSchema>;

export type StreamDeltaDto = z.infer<typeof streamDeltaSchema>;

export type StreamDoneDto = z.infer<typeof streamDoneSchema>;
