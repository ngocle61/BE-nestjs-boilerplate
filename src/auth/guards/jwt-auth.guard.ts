import {
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { ERROR_MESSAGE_KEYS } from '../../common/constants/error-codes.constants.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface.js';
import type { JwtPayload } from '../interfaces/jwt-payload.interface.js';
import { toAuthenticatedUser } from '../permissions/permissions.util.js';
import { extractBearerToken } from '../utils/token.util.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractBearerToken(request.headers.authorization);
    if (!token) throw new UnauthorizedException(ERROR_MESSAGE_KEYS.UNAUTHORIZED);

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      request.user = toAuthenticatedUser(payload);
    } catch {
      throw new UnauthorizedException(ERROR_MESSAGE_KEYS.UNAUTHORIZED);
    }

    return true;
  }
}
