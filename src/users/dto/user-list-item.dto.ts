import { z } from 'zod';

import { Role } from '../../generated/prisma/enums.js';

export const userListItemSchema = z
  .object({
    id: z.string(),
    email: z.string(),
    fullName: z.string(),
    avatarUrl: z.string().nullable(),
    role: z.enum(Role),
    isActive: z.boolean(),
    createdAt: z.date(),
  })
  .meta({ id: 'UserListItem' });

export type UserListItemDto = z.infer<typeof userListItemSchema>;
