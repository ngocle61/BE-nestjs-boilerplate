import { z } from 'zod';

import { userListItemSchema } from './user-list-item.dto.js';

export const userListResponseSchema = z
  .object({
    items: z.array(userListItemSchema),
    total: z.number().int(),
    page: z.number().int(),
    pageSize: z.number().int(),
  })
  .meta({ id: 'UserListResponse' });

export type UserListResponseDto = z.infer<typeof userListResponseSchema>;
