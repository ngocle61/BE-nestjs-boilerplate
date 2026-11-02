import { Test } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';

import type { ClientResponseDto } from '../../src/clients/dto/client-response.dto.js';
import { ClientsController } from '../../src/clients/clients.controller.js';
import { ClientsService } from '../../src/clients/clients.service.js';

const CLIENT: ClientResponseDto = {
  id: 'client-1',
  name: 'Riverside Apartments',
  phone: null,
  email: null,
  addressLine: null,
  postalCode: null,
  city: null,
  notes: null,
  createdAt: new Date('2025-12-01T00:00:00.000Z'),
};

describe('ClientsController', () => {
  it('creates a client', async () => {
    const create = vi.fn().mockResolvedValue(CLIENT);
    const moduleRef = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [{ provide: ClientsService, useValue: { create } }],
    }).compile();

    const controller = moduleRef.get(ClientsController);
    const dto = { name: 'Riverside Apartments' };

    await expect(controller.create(dto)).resolves.toEqual(CLIENT);
    expect(create).toHaveBeenCalledWith(dto);
  });

  it('lists clients matching the search query', async () => {
    const list = vi.fn().mockResolvedValue([CLIENT]);
    const moduleRef = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [{ provide: ClientsService, useValue: { list } }],
    }).compile();

    const controller = moduleRef.get(ClientsController);
    const query = { search: 'riverside' };

    await expect(controller.list(query)).resolves.toEqual([CLIENT]);
    expect(list).toHaveBeenCalledWith(query);
  });
});
