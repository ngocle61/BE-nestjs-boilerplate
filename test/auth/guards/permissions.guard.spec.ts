import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { describe, expect, it } from 'vitest';

import { PermissionsGuard } from '../../../src/auth/guards/permissions.guard.js';
import {
  PERMISSIONS,
  type Permission,
} from '../../../src/auth/permissions/permissions.constants.js';
import { ERROR_MESSAGE_KEYS } from '../../../src/common/constants/error-codes.constants.js';

const createGuard = (required: Permission[] | undefined) =>
  new PermissionsGuard({ getAllAndOverride: () => required } as unknown as Reflector);

const createContext = (permissions: readonly Permission[]) =>
  ({
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user: { id: 'user-1', permissions } }) }),
  }) as unknown as ExecutionContext;

describe('PermissionsGuard', () => {
  it('allows routes that require no permission', () => {
    expect(createGuard(undefined).canActivate(createContext([]))).toBe(true);
  });

  it('allows users that hold every required permission', () => {
    const guard = createGuard([PERMISSIONS.CALENDAR_VIEW]);

    expect(guard.canActivate(createContext([PERMISSIONS.CALENDAR_VIEW]))).toBe(true);
  });

  it('rejects with the message key of the first missing permission', () => {
    const guard = createGuard([PERMISSIONS.CALENDAR_VIEW, PERMISSIONS.CALENDAR_MANAGE]);

    expect(() => guard.canActivate(createContext([PERMISSIONS.CALENDAR_VIEW]))).toThrow(
      new ForbiddenException(ERROR_MESSAGE_KEYS.FORBIDDEN_CALENDAR_MANAGE),
    );
  });
});
