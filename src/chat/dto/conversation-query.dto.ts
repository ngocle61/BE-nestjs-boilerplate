import { z } from 'zod';

export const conversationQuerySchema = z.object({
  interventionId: z.uuid().optional(),
});

export type ConversationQueryDto = z.infer<typeof conversationQuerySchema>;
