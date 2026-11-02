import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { DEMO_PASSWORD } from '../prisma/seed-data.js';
import { AppModule } from '../src/app.module.js';
import { ERROR_CODES } from '../src/common/constants/error-codes.constants.js';

describe('Interventions (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let viewerToken: string;
  let clientId: string;

  const signIn = (email: string) =>
    request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email, password: DEMO_PASSWORD })
      .then((response) => response.body.accessToken as string);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    adminToken = await signIn('admin@example.com');
    viewerToken = await signIn('viewer@example.com');

    const clientResponse = await request(app.getHttpServer())
      .post('/clients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Interventions E2E Client' });
    clientId = clientResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects intervention creation from a viewer', async () => {
    const response = await request(app.getHttpServer())
      .post('/interventions')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ clientId, type: 'Maintenance', durationMinutes: 60 });

    expect(response.status).toBe(403);
    expect(response.body.code).toBe(ERROR_CODES.FORBIDDEN);
  });

  it('creates an unscheduled intervention, schedules it, then completes and deletes it', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/interventions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ clientId, type: 'Maintenance', durationMinutes: 60 });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.status).toBe('TO_SCHEDULE');
    expect(createResponse.body.startsAt).toBeNull();
    expect(createResponse.body.client.id).toBe(clientId);

    const interventionId = createResponse.body.id;
    const startsAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const scheduleResponse = await request(app.getHttpServer())
      .patch(`/interventions/${interventionId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ startsAt });

    expect(scheduleResponse.status).toBe(200);
    expect(scheduleResponse.body.status).toBe('SCHEDULED');
    expect(new Date(scheduleResponse.body.startsAt).toISOString()).toBe(startsAt);

    const completeResponse = await request(app.getHttpServer())
      .patch(`/interventions/${interventionId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'COMPLETED' });

    expect(completeResponse.status).toBe(200);
    expect(completeResponse.body.status).toBe('COMPLETED');

    const deleteResponse = await request(app.getHttpServer())
      .delete(`/interventions/${interventionId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deleteResponse.status).toBe(204);

    const getResponse = await request(app.getHttpServer())
      .get(`/interventions/${interventionId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(getResponse.status).toBe(404);
    expect(getResponse.body.code).toBe(ERROR_CODES.NOT_FOUND);
  });

  it('filters the unscheduled list to interventions without a start time', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/interventions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ clientId, type: 'Follow-up', durationMinutes: 30 });
    const interventionId = createResponse.body.id;

    const listResponse = await request(app.getHttpServer())
      .get('/interventions')
      .query({ unscheduled: 'true' })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.every((item: { startsAt: null }) => item.startsAt === null)).toBe(
      true,
    );
    expect(listResponse.body.some((item: { id: string }) => item.id === interventionId)).toBe(true);

    await request(app.getHttpServer())
      .delete(`/interventions/${interventionId}`)
      .set('Authorization', `Bearer ${adminToken}`);
  });
});
