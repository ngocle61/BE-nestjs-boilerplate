import { z } from 'zod';

import { InterventionStatus, TimeSlot } from '../../generated/prisma/enums.js';

export const interventionClientSummarySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    phone: z.string().nullable(),
    addressLine: z.string().nullable(),
    postalCode: z.string().nullable(),
    city: z.string().nullable(),
  })
  .meta({ id: 'InterventionClientSummary' });

export const interventionTechnicianSummarySchema = z
  .object({
    id: z.string(),
    fullName: z.string(),
    avatarUrl: z.string().nullable(),
  })
  .meta({ id: 'InterventionTechnicianSummary' });

export const interventionResponseSchema = z
  .object({
    id: z.string(),
    type: z.string(),
    status: z.enum(InterventionStatus),
    startsAt: z.date().nullable(),
    durationMinutes: z.number().int(),
    isUrgent: z.boolean(),
    notes: z.string().nullable(),
    callbackAt: z.date().nullable(),
    preferredSlot: z.enum(TimeSlot).nullable(),
    callbackAttempts: z.number().int(),
    createdAt: z.date(),
    updatedAt: z.date(),
    client: interventionClientSummarySchema,
    technician: interventionTechnicianSummarySchema.nullable(),
  })
  .meta({ id: 'InterventionResponse' });

export type InterventionClientSummary = z.infer<typeof interventionClientSummarySchema>;

export type InterventionTechnicianSummary = z.infer<typeof interventionTechnicianSummarySchema>;

export type InterventionResponseDto = z.infer<typeof interventionResponseSchema>;
