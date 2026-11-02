import {
  ForbiddenException,
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator.js';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface.js';
import {
  PERMISSION_FORBIDDEN_MESSAGE_KEYS,
  type Permission,
} from '../permissions/permissions.constants.js';
import { findMissingPermission } from '../permissions/permissions.util.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Permission[] | undefined>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;

    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const missing = findMissingPermission(user?.permissions ?? [], required);
    if (!missing) return true;

    throw new ForbiddenException(PERMISSION_FORBIDDEN_MESSAGE_KEYS[missing]);
  }
}
