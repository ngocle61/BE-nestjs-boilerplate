import { Test } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';

import { Role } from '../../src/generated/prisma/enums.js';
import type { UserListResponseDto } from '../../src/users/dto/user-list-response.dto.js';
import type { UserResponseDto } from '../../src/users/dto/user-response.dto.js';
import { UsersController } from '../../src/users/users.controller.js';
import { UsersService } from '../../src/users/users.service.js';

const PROFILE: UserResponseDto = {
  id: 'user-1',
  email: 'member@example.com',
  fullName: 'Morgan Tran',
  avatarUrl: null,
  role: Role.MEMBER,
  permissions: [],
};

const CURRENT_USER = { id: 'admin-1', role: Role.ADMIN, permissions: [] };

describe('UsersController', () => {
  it('returns the profile of the authenticated user', async () => {
    const getProfile = vi.fn().mockResolvedValue(PROFILE);
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: { getProfile } }],
    }).compile();

    const controller = moduleRef.get(UsersController);

    await expect(
      controller.getProfile({ id: PROFILE.id, role: PROFILE.role, permissions: [] }),
    ).resolves.toEqual(PROFILE);
    expect(getProfile).toHaveBeenCalledWith(PROFILE.id);
  });

  it('delegates the paginated list to the service with the parsed query', async () => {
    const response: UserListResponseDto = { items: [], total: 0, page: 1, pageSize: 20 };
    const listPaginated = vi.fn().mockResolvedValue(response);
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: { listPaginated } }],
    }).compile();

    const controller = moduleRef.get(UsersController);
    const query = { page: 1, pageSize: 20 };

    await expect(controller.list(query)).resolves.toEqual(response);
    expect(listPaginated).toHaveBeenCalledWith(query);
  });

  it('creates a user', async () => {
    const create = vi.fn().mockResolvedValue(PROFILE);
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: { create } }],
    }).compile();

    const controller = moduleRef.get(UsersController);
    const dto = {
      email: PROFILE.email,
      fullName: PROFILE.fullName,
      password: 'password123',
      role: Role.MEMBER,
    };

    await expect(controller.create(dto)).resolves.toEqual(PROFILE);
    expect(create).toHaveBeenCalledWith(dto);
  });

  it('updates a user on behalf of the current admin', async () => {
    const update = vi.fn().mockResolvedValue(PROFILE);
    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: { update } }],
    }).compile();

    const controller = moduleRef.get(UsersController);
    const dto = { isActive: false };

    await expect(controller.update(PROFILE.id, dto, CURRENT_USER)).resolves.toEqual(PROFILE);
    expect(update).toHaveBeenCalledWith(PROFILE.id, dto, CURRENT_USER.id);
  });
});
