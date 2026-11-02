import { z } from 'zod';

import { Role } from '../../generated/prisma/enums.js';

export const userSummarySchema = z
  .object({
    id: z.string(),
    fullName: z.string(),
    avatarUrl: z.string().nullable(),
    role: z.enum(Role),
  })
  .meta({ id: 'UserSummary' });

export type UserSummaryDto = z.infer<typeof userSummarySchema>;
