import { z } from 'zod';

import { MAX_MESSAGE_LENGTH } from '../chat.constants.js';

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
  interventionId: z.uuid().optional(),
});

export type SendMessageDto = z.infer<typeof sendMessageSchema>;
