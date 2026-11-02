import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiDefaultResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { z } from 'zod';

import { RequirePermissions } from '../auth/decorators/require-permissions.decorator.js';
import { PERMISSIONS } from '../auth/permissions/permissions.constants.js';
import { errorResponseSchema } from '../common/dto/error-response.dto.js';
import { ClientsService } from './clients.service.js';
import { clientQuerySchema, type ClientQueryDto } from './dto/client-query.dto.js';
import { clientResponseSchema, type ClientResponseDto } from './dto/client-response.dto.js';
import { createClientSchema, type CreateClientDto } from './dto/create-client.dto.js';

@ApiBearerAuth()
@ApiDefaultResponse({ standardSchema: errorResponseSchema })
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.CALENDAR_VIEW)
  @ApiOkResponse({ standardSchema: z.array(clientResponseSchema) })
  list(@Query({ schema: clientQuerySchema }) query: ClientQueryDto): Promise<ClientResponseDto[]> {
    return this.clientsService.list(query);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.CALENDAR_MANAGE)
  @ApiCreatedResponse({ standardSchema: clientResponseSchema })
  create(@Body({ schema: createClientSchema }) dto: CreateClientDto): Promise<ClientResponseDto> {
    return this.clientsService.create(dto);
  }
}
