import { z } from 'zod';

import { InterventionStatus, TimeSlot } from '../../generated/prisma/enums.js';

export const updateInterventionSchema = z.object({
  clientId: z.uuid().optional(),
  type: z.string().trim().min(1).max(100).optional(),
  technicianId: z.uuid().nullish(),
  status: z.enum(InterventionStatus).optional(),
  startsAt: z.coerce.date().nullish(),
  durationMinutes: z.number().int().min(15).max(480).optional(),
  isUrgent: z.boolean().optional(),
  notes: z.string().trim().max(2000).nullish(),
  callbackAt: z.coerce.date().nullish(),
  preferredSlot: z.enum(TimeSlot).nullish(),
});

export type UpdateInterventionDto = z.infer<typeof updateInterventionSchema>;
