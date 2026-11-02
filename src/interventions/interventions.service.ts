import { Injectable, NotFoundException } from '@nestjs/common';

import { ERROR_MESSAGE_KEYS } from '../common/constants/error-codes.constants.js';
import type { Prisma } from '../generated/prisma/client.js';
import { InterventionStatus } from '../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateInterventionDto } from './dto/create-intervention.dto.js';
import type { InterventionQueryDto } from './dto/intervention-query.dto.js';
import type { InterventionResponseDto } from './dto/intervention-response.dto.js';
import type { UpdateInterventionDto } from './dto/update-intervention.dto.js';
import { toInterventionResponse, type InterventionWithRelations } from './interventions.mapper.js';

const INCLUDE_RELATIONS = { client: true, technician: true } as const;

@Injectable()
export class InterventionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: InterventionQueryDto): Promise<InterventionResponseDto[]> {
    const where = this.buildWhere(query);

    const interventions = await this.prisma.intervention.findMany({
      where,
      include: INCLUDE_RELATIONS,
      orderBy: { startsAt: 'asc' },
    });

    return interventions.map((intervention) =>
      toInterventionResponse(intervention as InterventionWithRelations),
    );
  }

  async findByIdOrThrow(id: string): Promise<InterventionResponseDto> {
    const intervention = await this.prisma.intervention.findUnique({
      where: { id },
      include: INCLUDE_RELATIONS,
    });
    if (!intervention) throw new NotFoundException(ERROR_MESSAGE_KEYS.INTERVENTION_NOT_FOUND);
    return toInterventionResponse(intervention as InterventionWithRelations);
  }

  async create(dto: CreateInterventionDto, createdById: string): Promise<InterventionResponseDto> {
    const intervention = await this.prisma.intervention.create({
      data: {
        client: { connect: { id: dto.clientId } },
        type: dto.type,
        technician: dto.technicianId ? { connect: { id: dto.technicianId } } : undefined,
        status: dto.startsAt ? InterventionStatus.SCHEDULED : InterventionStatus.TO_SCHEDULE,
        startsAt: dto.startsAt ?? null,
        durationMinutes: dto.durationMinutes,
        isUrgent: dto.isUrgent,
        notes: dto.notes,
        callbackAt: dto.callbackAt ?? null,
        preferredSlot: dto.preferredSlot ?? null,
        createdBy: { connect: { id: createdById } },
      },
      include: INCLUDE_RELATIONS,
    });

    return toInterventionResponse(intervention as InterventionWithRelations);
  }

  async update(id: string, dto: UpdateInterventionDto): Promise<InterventionResponseDto> {
    await this.findByIdOrThrow(id);

    const startsAtProvided = dto.startsAt !== undefined;
    const intervention = await this.prisma.intervention.update({
      where: { id },
      data: {
        client: dto.clientId ? { connect: { id: dto.clientId } } : undefined,
        type: dto.type,
        technician:
          dto.technicianId === undefined
            ? undefined
            : dto.technicianId
              ? { connect: { id: dto.technicianId } }
              : { disconnect: true },
        status:
          dto.status ??
          (startsAtProvided && dto.startsAt ? InterventionStatus.SCHEDULED : undefined),
        startsAt: startsAtProvided ? dto.startsAt : undefined,
        durationMinutes: dto.durationMinutes,
        isUrgent: dto.isUrgent,
        notes: dto.notes,
        callbackAt: dto.callbackAt,
        preferredSlot: dto.preferredSlot,
      },
      include: INCLUDE_RELATIONS,
    });

    return toInterventionResponse(intervention as InterventionWithRelations);
  }

  async remove(id: string): Promise<void> {
    await this.findByIdOrThrow(id);
    await this.prisma.intervention.delete({ where: { id } });
  }

  private buildWhere(query: InterventionQueryDto): Prisma.InterventionWhereInput {
    const where: Prisma.InterventionWhereInput = {};

    if (query.unscheduled) {
      where.startsAt = null;
    } else if (query.from || query.to) {
      where.startsAt = {
        ...(query.from ? { gte: query.from } : {}),
        ...(query.to ? { lte: query.to } : {}),
      };
    }

    if (query.technicianId) where.technicianId = query.technicianId;
    if (query.status?.length) where.status = { in: query.status };
    if (query.search) {
      where.OR = [
        { type: { contains: query.search, mode: 'insensitive' } },
        { notes: { contains: query.search, mode: 'insensitive' } },
        { client: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    return where;
  }
}
