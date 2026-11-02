import { z } from 'zod';

import { messageResponseSchema } from './message-response.dto.js';

export const conversationResponseSchema = z
  .object({
    id: z.string(),
    interventionId: z.string().nullable(),
    messages: z.array(messageResponseSchema),
  })
  .meta({ id: 'ConversationResponse' });

export type ConversationResponseDto = z.infer<typeof conversationResponseSchema>;
