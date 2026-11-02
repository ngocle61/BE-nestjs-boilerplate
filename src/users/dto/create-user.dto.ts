import { z } from 'zod';

import { Role } from '../../generated/prisma/enums.js';
import {
  MAX_EMAIL_LENGTH,
  MAX_FULL_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from '../users.constants.js';

export const createUserSchema = z.object({
  email: z.string().trim().toLowerCase().max(MAX_EMAIL_LENGTH).pipe(z.email()),
  fullName: z.string().trim().min(1).max(MAX_FULL_NAME_LENGTH),
  password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
  role: z.enum(Role),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
