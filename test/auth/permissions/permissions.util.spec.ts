import { describe, expect, it } from 'vitest';

import { Role } from '../../../src/generated/prisma/enums.js';
import { PERMISSIONS } from '../../../src/auth/permissions/permissions.constants.js';
import {
  findMissingPermission,
  hasAllPermissions,
  resolvePermissions,
  toAuthenticatedUser,
} from '../../../src/auth/permissions/permissions.util.js';

describe('permissions util', () => {
  it('grants every permission to administrators', () => {
    expect(resolvePermissions(Role.ADMIN)).toEqual(Object.values(PERMISSIONS));
  });

  it('keeps viewers read-only', () => {
    const viewer = resolvePermissions(Role.VIEWER);

    expect(hasAllPermissions(viewer, [PERMISSIONS.CALENDAR_VIEW])).toBe(true);
    expect(hasAllPermissions(viewer, [PERMISSIONS.CALENDAR_MANAGE])).toBe(false);
  });

  it('finds the first required permission a role lacks', () => {
    const viewer = resolvePermissions(Role.VIEWER);
    const required = [PERMISSIONS.CALENDAR_VIEW, PERMISSIONS.CALENDAR_MANAGE];

    expect(findMissingPermission(viewer, required)).toBe(PERMISSIONS.CALENDAR_MANAGE);
    expect(findMissingPermission(resolvePermissions(Role.ADMIN), required)).toBeUndefined();
  });

  it('builds the authenticated user from a JWT payload', () => {
    expect(toAuthenticatedUser({ sub: 'user-1', role: Role.MEMBER })).toEqual({
      id: 'user-1',
      role: Role.MEMBER,
      permissions: resolvePermissions(Role.MEMBER),
    });
  });
});
