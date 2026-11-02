import { z } from 'zod';

export const clientQuerySchema = z.object({
  search: z.string().trim().min(1).max(200).optional(),
});

export type ClientQueryDto = z.infer<typeof clientQuerySchema>;
