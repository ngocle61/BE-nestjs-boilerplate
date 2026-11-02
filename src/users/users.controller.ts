import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiDefaultResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { z } from 'zod';

import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
import { PERMISSIONS } from '../auth/permissions/permissions.constants.js';
import { errorResponseSchema } from '../common/dto/error-response.dto.js';
import { createUserSchema, type CreateUserDto } from './dto/create-user.dto.js';
import { updateUserSchema, type UpdateUserDto } from './dto/update-user.dto.js';
import { userListQuerySchema, type UserListQueryDto } from './dto/user-list-query.dto.js';
import { userListResponseSchema, type UserListResponseDto } from './dto/user-list-response.dto.js';
import { userResponseSchema, type UserResponseDto } from './dto/user-response.dto.js';
import { userSummarySchema, type UserSummaryDto } from './dto/user-summary.dto.js';
import { UsersService } from './users.service.js';

@ApiBearerAuth()
@ApiDefaultResponse({ standardSchema: errorResponseSchema })
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOkResponse({ standardSchema: userResponseSchema })
  getProfile(@CurrentUser() user: AuthenticatedUser): Promise<UserResponseDto> {
    return this.usersService.getProfile(user.id);
  }

  @Get('technicians')
  @ApiOkResponse({ standardSchema: z.array(userSummarySchema) })
  listTechnicians(): Promise<UserSummaryDto[]> {
    return this.usersService.listTechnicians();
  }

  @Get()
  @RequirePermissions(PERMISSIONS.USER_MANAGE)
  @ApiOkResponse({ standardSchema: userListResponseSchema })
  list(
    @Query({ schema: userListQuerySchema }) query: UserListQueryDto,
  ): Promise<UserListResponseDto> {
    return this.usersService.listPaginated(query);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.USER_MANAGE)
  @ApiCreatedResponse({ standardSchema: userResponseSchema })
  create(@Body({ schema: createUserSchema }) dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.USER_MANAGE)
  @ApiOkResponse({ standardSchema: userResponseSchema })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body({ schema: updateUserSchema }) dto: UpdateUserDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, dto, currentUser.id);
  }
}
