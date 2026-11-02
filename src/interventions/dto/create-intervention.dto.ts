import { z } from 'zod';

import { TimeSlot } from '../../generated/prisma/enums.js';

export const createInterventionSchema = z.object({
  clientId: z.uuid(),
  type: z.string().trim().min(1).max(100),
  technicianId: z.uuid().nullish(),
  startsAt: z.coerce.date().nullish(),
  durationMinutes: z.number().int().min(15).max(480),
  isUrgent: z.boolean().default(false),
  notes: z.string().trim().max(2000).optional(),
  callbackAt: z.coerce.date().nullish(),
  preferredSlot: z.enum(TimeSlot).nullish(),
});

export type CreateInterventionDto = z.infer<typeof createInterventionSchema>;
