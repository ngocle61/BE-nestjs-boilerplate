import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

import type { AuthenticatedRequest } from '../interfaces/authenticated-request.interface.js';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().user as AuthenticatedUser,
);
