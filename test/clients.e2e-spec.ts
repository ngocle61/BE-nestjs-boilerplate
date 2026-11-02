import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { DEMO_PASSWORD } from '../prisma/seed-data.js';
import { AppModule } from '../src/app.module.js';
import { ERROR_CODES } from '../src/common/constants/error-codes.constants.js';

describe('Clients (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let viewerToken: string;

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects client creation from a viewer', async () => {
    const response = await request(app.getHttpServer())
      .post('/clients')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ name: 'Clients E2E Co' });

    expect(response.status).toBe(403);
    expect(response.body.code).toBe(ERROR_CODES.FORBIDDEN);
  });

  it('creates a client and finds it by search', async () => {
    const uniqueName = `Clients E2E Co ${Date.now()}`;

    const createResponse = await request(app.getHttpServer())
      .post('/clients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: uniqueName, phone: '+1 555 0199' });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.name).toBe(uniqueName);

    const searchResponse = await request(app.getHttpServer())
      .get('/clients')
      .query({ search: uniqueName })
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(searchResponse.status).toBe(200);
    expect(searchResponse.body).toHaveLength(1);
    expect(searchResponse.body[0].name).toBe(uniqueName);
  });

  it('rejects an invalid create payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/clients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: '' });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe(ERROR_CODES.VALIDATION_FAILED);
  });
});
