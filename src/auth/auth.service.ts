import { Injectable } from '@nestjs/common';

import { toUserResponse } from '../users/users.mapper.js';
import { UsersService } from '../users/users.service.js';
import type { RefreshTokenDto } from './dto/refresh-token.dto.js';
import type { SignInResponseDto } from './dto/sign-in-response.dto.js';
import type { SignInDto } from './dto/sign-in.dto.js';
import type { TokenPairDto } from './dto/token-pair.dto.js';
import { InvalidCredentialsException } from './exceptions/invalid-credentials.exception.js';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface.js';
import { PasswordService } from './password.service.js';
import { TokenService } from './token.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async signIn({ email, password }: SignInDto): Promise<SignInResponseDto> {
    const user = await this.usersService.findByEmail(email);
    const isPasswordValid = await this.passwordService.verify(user?.passwordHash, password);

    if (!user || !user.isActive || !isPasswordValid) throw new InvalidCredentialsException();

    const tokens = await this.tokenService.issueTokenPair(user);
    return { ...tokens, user: toUserResponse(user) };
  }

  refreshToken({ refreshToken }: RefreshTokenDto): Promise<TokenPairDto> {
    return this.tokenService.rotateRefreshToken(refreshToken);
  }

  signOut(user: AuthenticatedUser, { refreshToken }: RefreshTokenDto): Promise<void> {
    return this.tokenService.revokeRefreshToken(user.id, refreshToken);
  }
}
