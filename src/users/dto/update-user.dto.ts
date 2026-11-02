import { z } from 'zod';

import { Role } from '../../generated/prisma/enums.js';
import { MAX_FULL_NAME_LENGTH } from '../users.constants.js';

export const updateUserSchema = z.object({
  fullName: z.string().trim().min(1).max(MAX_FULL_NAME_LENGTH).optional(),
  role: z.enum(Role).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
