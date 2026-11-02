import { z } from 'zod';

export const messageResponseSchema = z
  .object({
    id: z.string(),
    body: z.string(),
    isAssistant: z.boolean(),
    createdAt: z.date(),
  })
  .meta({ id: 'MessageResponse' });

export type MessageResponseDto = z.infer<typeof messageResponseSchema>;
