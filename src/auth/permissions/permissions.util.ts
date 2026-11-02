import type { Role } from '../../generated/prisma/enums.js';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface.js';
import type { JwtPayload } from '../interfaces/jwt-payload.interface.js';
import { ROLE_PERMISSIONS, type Permission } from './permissions.constants.js';

export const resolvePermissions = (role: Role): readonly Permission[] => ROLE_PERMISSIONS[role];

export const hasAllPermissions = (
  granted: readonly Permission[],
  required: readonly Permission[],
): boolean => required.every((permission) => granted.includes(permission));

export const findMissingPermission = (
  granted: readonly Permission[],
  required: readonly Permission[],
): Permission | undefined => required.find((permission) => !granted.includes(permission));

export const toAuthenticatedUser = (payload: JwtPayload): AuthenticatedUser => ({
  id: payload.sub,
  role: payload.role,
  permissions: resolvePermissions(payload.role),
});
