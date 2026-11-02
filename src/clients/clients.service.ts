import { Injectable, NotFoundException } from '@nestjs/common';

import { ERROR_MESSAGE_KEYS } from '../common/constants/error-codes.constants.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { toClientResponse } from './clients.mapper.js';
import type { ClientQueryDto } from './dto/client-query.dto.js';
import type { ClientResponseDto } from './dto/client-response.dto.js';
import type { CreateClientDto } from './dto/create-client.dto.js';

const SEARCH_RESULT_LIMIT = 50;

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ClientQueryDto): Promise<ClientResponseDto[]> {
    const clients = await this.prisma.client.findMany({
      where: query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { phone: { contains: query.search, mode: 'insensitive' } },
              { email: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      orderBy: { name: 'asc' },
      take: SEARCH_RESULT_LIMIT,
    });

    return clients.map(toClientResponse);
  }

  async findByIdOrThrow(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException(ERROR_MESSAGE_KEYS.CLIENT_NOT_FOUND);
    return client;
  }

  async create(dto: CreateClientDto): Promise<ClientResponseDto> {
    const client = await this.prisma.client.create({ data: dto });
    return toClientResponse(client);
  }
}
