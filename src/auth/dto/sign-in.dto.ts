import { z } from 'zod';

import { MAX_EMAIL_LENGTH, MAX_PASSWORD_LENGTH } from '../auth.constants.js';

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().max(MAX_EMAIL_LENGTH).pipe(z.email()),
  password: z.string().min(1).max(MAX_PASSWORD_LENGTH),
});

export type SignInDto = z.infer<typeof signInSchema>;
