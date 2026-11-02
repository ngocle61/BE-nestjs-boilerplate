import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import authConfig from '../config/auth.config.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { TokenPairDto } from './dto/token-pair.dto.js';
import { InvalidRefreshTokenException } from './exceptions/invalid-refresh-token.exception.js';
import type { JwtPayload } from './interfaces/jwt-payload.interface.js';
import type { TokenSubject } from './interfaces/token-subject.interface.js';
import { addDays, createRefreshToken, hashToken } from './utils/token.util.js';

@Injectable()
export class TokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(authConfig.KEY) private readonly auth: ConfigType<typeof authConfig>,
  ) {}

  async issueTokenPair(subject: TokenSubject): Promise<TokenPairDto> {
    const refreshToken = createRefreshToken();

    await this.prisma.refreshToken.create({
      data: {
        userId: subject.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: addDays(new Date(), this.auth.refreshTokenTtlDays),
      },
    });

    return { accessToken: await this.signAccessToken(subject), refreshToken };
  }

  async rotateRefreshToken(refreshToken: string): Promise<TokenPairDto> {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(refreshToken) },
      include: { user: true },
    });

    if (!stored) throw new InvalidRefreshTokenException();

    if (stored.revokedAt) {
      await this.revokeAllForUser(stored.userId);
      throw new InvalidRefreshTokenException();
    }

    if (stored.expiresAt <= new Date() || !stored.user.isActive) {
      throw new InvalidRefreshTokenException();
    }

    const { count } = await this.prisma.refreshToken.updateMany({
      where: { id: stored.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (count === 0) throw new InvalidRefreshTokenException();

    return this.issueTokenPair(stored.user);
  }

  async revokeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, tokenHash: hashToken(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private signAccessToken(subject: TokenSubject): Promise<string> {
    return this.jwtService.signAsync({
      sub: subject.id,
      role: subject.role,
    } satisfies JwtPayload);
  }
}
