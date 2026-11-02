import { z } from 'zod';

import { InterventionStatus } from '../../generated/prisma/enums.js';

const toStatusArray = (value: unknown) =>
  typeof value === 'string'
    ? value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
    : value;

export const interventionQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  technicianId: z.uuid().optional(),
  status: z.preprocess(toStatusArray, z.array(z.enum(InterventionStatus)).optional()),
  unscheduled: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
  search: z.string().trim().min(1).max(200).optional(),
});

export type InterventionQueryDto = z.infer<typeof interventionQuerySchema>;
