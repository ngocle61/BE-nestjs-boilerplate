import type { Role } from '../../generated/prisma/enums.js';
import type { Permission } from '../permissions/permissions.constants.js';

export interface AuthenticatedUser {
  id: string;
  role: Role;
  permissions: readonly Permission[];
}
