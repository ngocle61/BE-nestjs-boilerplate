import { z } from 'zod';

import { Role } from '../../generated/prisma/enums.js';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../users.constants.js';

export const userListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(DEFAULT_PAGE),
  pageSize: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  search: z.string().trim().min(1).max(200).optional(),
  role: z.enum(Role).optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});

export type UserListQueryDto = z.infer<typeof userListQuerySchema>;
