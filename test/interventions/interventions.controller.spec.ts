import { Test } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';

import { Role } from '../../src/generated/prisma/enums.js';
import type { InterventionResponseDto } from '../../src/interventions/dto/intervention-response.dto.js';
import { InterventionsController } from '../../src/interventions/interventions.controller.js';
import { InterventionsService } from '../../src/interventions/interventions.service.js';

const INTERVENTION: InterventionResponseDto = {
  id: 'intervention-1',
  type: 'Maintenance',
  status: 'SCHEDULED',
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
    phone: null,
    addressLine: null,
    postalCode: null,
    city: null,
  },
  technician: null,
};

const CURRENT_USER = { id: 'admin-1', role: Role.ADMIN, permissions: [] };

describe('InterventionsController', () => {
  it('creates an intervention on behalf of the current user', async () => {
    const create = vi.fn().mockResolvedValue(INTERVENTION);
    const moduleRef = await Test.createTestingModule({
      controllers: [InterventionsController],
      providers: [{ provide: InterventionsService, useValue: { create } }],
    }).compile();

    const controller = moduleRef.get(InterventionsController);
    const dto = { clientId: 'client-1', type: 'Maintenance', durationMinutes: 60, isUrgent: false };

    await expect(controller.create(dto, CURRENT_USER)).resolves.toEqual(INTERVENTION);
    expect(create).toHaveBeenCalledWith(dto, CURRENT_USER.id);
  });

  it('delegates list to the service with the parsed query', async () => {
    const list = vi.fn().mockResolvedValue([INTERVENTION]);
    const moduleRef = await Test.createTestingModule({
      controllers: [InterventionsController],
      providers: [{ provide: InterventionsService, useValue: { list } }],
    }).compile();

    const controller = moduleRef.get(InterventionsController);
    const query = { unscheduled: false };

    await expect(controller.list(query)).resolves.toEqual([INTERVENTION]);
    expect(list).toHaveBeenCalledWith(query);
  });
});
