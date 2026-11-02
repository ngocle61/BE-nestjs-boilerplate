import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { DEMO_PASSWORD } from '../prisma/seed-data.js';
import { AppModule } from '../src/app.module.js';
import { ERROR_CODES } from '../src/common/constants/error-codes.constants.js';

describe('Users (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let adminId: string;
  let viewerToken: string;

  const signIn = async (email: string) => {
    const response = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email, password: DEMO_PASSWORD });
    return response.body as { accessToken: string; user: { id: string } };
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    const admin = await signIn('admin@example.com');
    adminToken = admin.accessToken;
    adminId = admin.user.id;
    viewerToken = (await signIn('viewer@example.com')).accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('lets any authenticated user fetch the technician list', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/technicians')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0]).not.toHaveProperty('email');
  });

  it('rejects the admin list and create from a viewer', async () => {
    const listResponse = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(listResponse.status).toBe(403);
    expect(listResponse.body.code).toBe(ERROR_CODES.FORBIDDEN);

    const createResponse = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({
        email: 'nope@example.com',
        fullName: 'Nope',
        password: 'password123',
        role: 'VIEWER',
      });
    expect(createResponse.status).toBe(403);
  });

  it('paginates and searches the user list for an admin', async () => {
    const response = await request(app.getHttpServer())
      .get('/users')
      .query({ page: 1, pageSize: 2, search: 'admin' })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.page).toBe(1);
    expect(response.body.pageSize).toBe(2);
    expect(response.body.items.length).toBeGreaterThan(0);
    expect(
      response.body.items.every((item: { email: string }) => item.email.includes('admin')),
    ).toBe(true);
  });

  it('creates a user and rejects a duplicate email', async () => {
    const email = `e2e-${Date.now()}@example.com`;

    const createResponse = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email, fullName: 'E2E User', password: 'password123', role: 'VIEWER' });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.email).toBe(email);

    const duplicateResponse = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ email, fullName: 'Another Name', password: 'password123', role: 'VIEWER' });

    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body.code).toBe(ERROR_CODES.EMAIL_ALREADY_IN_USE);

    const newUserId = createResponse.body.id;
    const updateResponse = await request(app.getHttpServer())
      .patch(`/users/${newUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'MEMBER', isActive: false });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.role).toBe('MEMBER');
  });

  it('prevents an admin from changing their own role or active status', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/users/${adminId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe(ERROR_CODES.BAD_REQUEST);
  });

  it('returns a 404 when updating an unknown user', async () => {
    const response = await request(app.getHttpServer())
      .patch('/users/00000000-0000-4000-8000-000000000000')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ fullName: 'Ghost' });

    expect(response.status).toBe(404);
    expect(response.body.code).toBe(ERROR_CODES.NOT_FOUND);
  });
});
