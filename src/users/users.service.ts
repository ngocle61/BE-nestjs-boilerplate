import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { hash } from 'argon2';

import { ARGON2_OPTIONS } from '../auth/auth.constants.js';
import { ERROR_MESSAGE_KEYS } from '../common/constants/error-codes.constants.js';
import type { Prisma, User } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';
import type { UserListQueryDto } from './dto/user-list-query.dto.js';
import type { UserListResponseDto } from './dto/user-list-response.dto.js';
import type { UserResponseDto } from './dto/user-response.dto.js';
import type { UserSummaryDto } from './dto/user-summary.dto.js';
import { UserEmailTakenException } from './exceptions/user-email-taken.exception.js';
import { toUserListItem, toUserResponse, toUserSummary } from './users.mapper.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async getProfile(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isActive) throw new UnauthorizedException(ERROR_MESSAGE_KEYS.UNAUTHORIZED);
    return toUserResponse(user);
  }

  async listTechnicians(): Promise<UserSummaryDto[]> {
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      orderBy: { fullName: 'asc' },
    });
    return users.map(toUserSummary);
  }

  async listPaginated(query: UserListQueryDto): Promise<UserListResponseDto> {
    const where: Prisma.UserWhereInput = {};
    if (query.role) where.role = query.role;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: items.map(toUserListItem),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.findByEmail(dto.email);
    if (existing) throw new UserEmailTakenException();

    const passwordHash = await hash(dto.password, ARGON2_OPTIONS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        role: dto.role,
        passwordHash,
      },
    });

    return toUserResponse(user);
  }

  async update(id: string, dto: UpdateUserDto, currentUserId: string): Promise<UserResponseDto> {
    if (id === currentUserId && (dto.role !== undefined || dto.isActive !== undefined)) {
      throw new BadRequestException(ERROR_MESSAGE_KEYS.CANNOT_MODIFY_OWN_ACCOUNT);
    }

    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(ERROR_MESSAGE_KEYS.USER_NOT_FOUND);

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        fullName: dto.fullName,
        role: dto.role,
        isActive: dto.isActive,
      },
    });

    return toUserResponse(user);
  }
}
