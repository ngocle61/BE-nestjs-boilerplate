import { z } from 'zod';

export const clientResponseSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    phone: z.string().nullable(),
    email: z.string().nullable(),
    addressLine: z.string().nullable(),
    postalCode: z.string().nullable(),
    city: z.string().nullable(),
    notes: z.string().nullable(),
    createdAt: z.date(),
  })
  .meta({ id: 'ClientResponse' });

export type ClientResponseDto = z.infer<typeof clientResponseSchema>;
