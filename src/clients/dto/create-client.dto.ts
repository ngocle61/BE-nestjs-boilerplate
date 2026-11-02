import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().trim().min(1).max(200),
  phone: z.string().trim().max(30).optional(),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()).optional(),
  addressLine: z.string().trim().max(200).optional(),
  postalCode: z.string().trim().max(20).optional(),
  city: z.string().trim().max(100).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export type CreateClientDto = z.infer<typeof createClientSchema>;
