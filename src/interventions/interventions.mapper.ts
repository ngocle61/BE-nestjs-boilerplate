import type { Client, Intervention, User } from '../generated/prisma/client.js';
import type { InterventionResponseDto } from './dto/intervention-response.dto.js';

export type InterventionWithRelations = Intervention & {
  client: Client;
  technician: User | null;
};

export const toInterventionResponse = (
  intervention: InterventionWithRelations,
): InterventionResponseDto => ({
  id: intervention.id,
  type: intervention.type,
  status: intervention.status,
  startsAt: intervention.startsAt,
  durationMinutes: intervention.durationMinutes,
  isUrgent: intervention.isUrgent,
  notes: intervention.notes,
  callbackAt: intervention.callbackAt,
  preferredSlot: intervention.preferredSlot,
  callbackAttempts: intervention.callbackAttempts,
  createdAt: intervention.createdAt,
  updatedAt: intervention.updatedAt,
  client: {
    id: intervention.client.id,
    name: intervention.client.name,
    phone: intervention.client.phone,
    addressLine: intervention.client.addressLine,
    postalCode: intervention.client.postalCode,
    city: intervention.client.city,
  },
  technician: intervention.technician
    ? {
        id: intervention.technician.id,
        fullName: intervention.technician.fullName,
        avatarUrl: intervention.technician.avatarUrl,
      }
    : null,
});
