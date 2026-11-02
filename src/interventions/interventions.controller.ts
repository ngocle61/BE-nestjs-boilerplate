import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiDefaultResponse,
  ApiNoContentResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { z } from 'zod';

import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
import { PERMISSIONS } from '../auth/permissions/permissions.constants.js';
import { errorResponseSchema } from '../common/dto/error-response.dto.js';
import {
  createInterventionSchema,
  type CreateInterventionDto,
} from './dto/create-intervention.dto.js';
import {
  interventionQuerySchema,
  type InterventionQueryDto,
} from './dto/intervention-query.dto.js';
import {
  interventionResponseSchema,
  type InterventionResponseDto,
} from './dto/intervention-response.dto.js';
import {
  updateInterventionSchema,
  type UpdateInterventionDto,
} from './dto/update-intervention.dto.js';
import { InterventionsService } from './interventions.service.js';

@ApiBearerAuth()
@ApiDefaultResponse({ standardSchema: errorResponseSchema })
@Controller('interventions')
export class InterventionsController {
  constructor(private readonly interventionsService: InterventionsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.CALENDAR_VIEW)
  @ApiOkResponse({ standardSchema: z.array(interventionResponseSchema) })
  list(
    @Query({ schema: interventionQuerySchema }) query: InterventionQueryDto,
  ): Promise<InterventionResponseDto[]> {
    return this.interventionsService.list(query);
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.CALENDAR_VIEW)
  @ApiOkResponse({ standardSchema: interventionResponseSchema })
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<InterventionResponseDto> {
    return this.interventionsService.findByIdOrThrow(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.CALENDAR_MANAGE)
  @ApiCreatedResponse({ standardSchema: interventionResponseSchema })
  create(
    @Body({ schema: createInterventionSchema }) dto: CreateInterventionDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<InterventionResponseDto> {
    return this.interventionsService.create(dto, user.id);
  }

  @Patch(':id')
  @RequirePermissions(PERMISSIONS.CALENDAR_MANAGE)
  @ApiOkResponse({ standardSchema: interventionResponseSchema })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body({ schema: updateInterventionSchema }) dto: UpdateInterventionDto,
  ): Promise<InterventionResponseDto> {
    return this.interventionsService.update(id, dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.CALENDAR_MANAGE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.interventionsService.remove(id);
  }
}
