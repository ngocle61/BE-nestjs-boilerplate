import { z } from 'zod';

import { PERMISSIONS } from '../../auth/permissions/permissions.constants.js';
import { Role } from '../../generated/prisma/enums.js';

export const userResponseSchema = z
  .object({
    id: z.string(),
    email: z.string(),
    fullName: z.string(),
    avatarUrl: z.string().nullable(),
    role: z.enum(Role),
    permissions: z.array(z.enum(PERMISSIONS)),
  })
  .meta({ id: 'UserResponse' });

export type UserResponseDto = z.infer<typeof userResponseSchema>;
