import { describe, expect, it } from 'vitest';

import { InterventionStatus, Role } from '../../src/generated/prisma/enums.js';
import {
  toInterventionResponse,
  type InterventionWithRelations,
} from '../../src/interventions/interventions.mapper.js';

const BASE_INTERVENTION: InterventionWithRelations = {
  id: 'intervention-1',
  clientId: 'client-1',
  technicianId: 'tech-1',
  createdById: 'admin-1',
  type: 'Maintenance',
  status: InterventionStatus.SCHEDULED,
  startsAt: new Date('2026-01-01T09:00:00.000Z'),
  durationMinutes: 60,
  isUrgent: false,
  notes: null,
  callbackAt: null,
  preferredSlot: null,
  callbackAttempts: 0,
  createdAt: new Date('2025-12-01T00:00:00.000Z'),
  updatedAt: new Date('2025-12-01T00:00:00.000Z'),
  client: {
    id: 'client-1',
    name: 'Riverside Apartments',
    phone: '+1 555 0101',
    email: null,
    addressLine: '48 Riverside Drive',
    postalCode: '10023',
    city: 'New York',
    notes: null,
    createdAt: new Date('2025-11-01T00:00:00.000Z'),
    updatedAt: new Date('2025-11-01T00:00:00.000Z'),
  },
  technician: {
    id: 'tech-1',
    email: 'admin@example.com',
    passwordHash: 'hash',
    fullName: 'Alex Nguyen',
    avatarUrl: null,
    role: Role.ADMIN,
    isActive: true,
    createdAt: new Date('2025-10-01T00:00:00.000Z'),
    updatedAt: new Date('2025-10-01T00:00:00.000Z'),
  },
};

describe('toInterventionResponse', () => {
  it('flattens the client and technician relations into summaries', () => {
    const response = toInterventionResponse(BASE_INTERVENTION);

    expect(response.client).toEqual({
      id: 'client-1',
      name: 'Riverside Apartments',
      phone: '+1 555 0101',
      addressLine: '48 Riverside Drive',
      postalCode: '10023',
      city: 'New York',
    });
    expect(response.technician).toEqual({
      id: 'tech-1',
      fullName: 'Alex Nguyen',
      avatarUrl: null,
    });
  });

  it('returns null technician when the intervention is unassigned', () => {
    const response = toInterventionResponse({ ...BASE_INTERVENTION, technician: null });

    expect(response.technician).toBeNull();
  });
});
