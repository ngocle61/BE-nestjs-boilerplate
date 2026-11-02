import { describe, expect, it } from 'vitest';

import { Role } from '../../src/generated/prisma/enums.js';
import type { User } from '../../src/generated/prisma/client.js';
import { toUserListItem, toUserResponse, toUserSummary } from '../../src/users/users.mapper.js';

const USER: User = {
  id: 'user-1',
  email: 'admin@example.com',
  passwordHash: 'hash',
  fullName: 'Alex Nguyen',
  avatarUrl: null,
  role: Role.ADMIN,
  isActive: true,
  createdAt: new Date('2025-01-01T00:00:00.000Z'),
  updatedAt: new Date('2025-01-01T00:00:00.000Z'),
};

describe('toUserResponse', () => {
  it('includes the permissions resolved from the role', () => {
    expect(toUserResponse(USER).permissions).toContain('user:manage');
  });
});

describe('toUserSummary', () => {
  it('exposes only the display fields', () => {
    expect(toUserSummary(USER)).toEqual({
      id: USER.id,
      fullName: USER.fullName,
      avatarUrl: USER.avatarUrl,
      role: USER.role,
    });
  });
});

describe('toUserListItem', () => {
  it('exposes the admin table fields', () => {
    expect(toUserListItem(USER)).toEqual({
      id: USER.id,
      email: USER.email,
      fullName: USER.fullName,
      avatarUrl: USER.avatarUrl,
      role: USER.role,
      isActive: USER.isActive,
      createdAt: USER.createdAt,
    });
  });
});
