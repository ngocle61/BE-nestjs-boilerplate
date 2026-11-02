import { resolvePermissions } from '../auth/permissions/permissions.util.js';
import type { User } from '../generated/prisma/client.js';
import type { UserListItemDto } from './dto/user-list-item.dto.js';
import type { UserResponseDto } from './dto/user-response.dto.js';
import type { UserSummaryDto } from './dto/user-summary.dto.js';

export const toUserResponse = (user: User): UserResponseDto => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  avatarUrl: user.avatarUrl,
  role: user.role,
  permissions: [...resolvePermissions(user.role)],
});

export const toUserSummary = (user: User): UserSummaryDto => ({
  id: user.id,
  fullName: user.fullName,
  avatarUrl: user.avatarUrl,
  role: user.role,
});

export const toUserListItem = (user: User): UserListItemDto => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  avatarUrl: user.avatarUrl,
  role: user.role,
  isActive: user.isActive,
  createdAt: user.createdAt,
});
