import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { DEMO_PASSWORD } from '../prisma/seed-data.js';
import { AppModule } from '../src/app.module.js';
import { PERMISSIONS } from '../src/auth/permissions/permissions.constants.js';
import { ERROR_CODES } from '../src/common/constants/error-codes.constants.js';
import { VALIDATION_MESSAGE_KEYS } from '../src/common/constants/validation-message-keys.constants.js';

const ADMIN_EMAIL = 'admin@example.com';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  const signIn = (email: string, password = DEMO_PASSWORD) =>
    request(app.getHttpServer()).post('/auth/sign-in').send({ email, password });

  const refresh = (refreshToken: string) =>
    request(app.getHttpServer()).post('/auth/refresh-token').send({ refreshToken });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/sign-in rejects invalid payloads with field errors', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email: 'nope' });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe(ERROR_CODES.VALIDATION_FAILED);
    expect(response.body.errors).toEqual({
      email: [{ key: VALIDATION_MESSAGE_KEYS.INVALID_EMAIL }],
      password: [{ key: VALIDATION_MESSAGE_KEYS.REQUIRED }],
    });
  });

  it('POST /auth/sign-in rejects a wrong password', async () => {
    const response = await signIn(ADMIN_EMAIL, 'wrong-password');

    expect(response.status).toBe(401);
    expect(response.body.code).toBe(ERROR_CODES.INVALID_CREDENTIALS);
  });

  it('signs in, reads the profile, rotates and detects refresh token reuse', async () => {
    const signInResponse = await signIn(` ${ADMIN_EMAIL.toUpperCase()} `);
    expect(signInResponse.status).toBe(200);
    expect(signInResponse.body.user).toMatchObject({ email: ADMIN_EMAIL, role: 'ADMIN' });
    expect(signInResponse.body.user.permissions).toEqual(Object.values(PERMISSIONS));

    const { accessToken, refreshToken } = signInResponse.body;

    const profileResponse = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body.email).toBe(ADMIN_EMAIL);

    const refreshResponse = await refresh(refreshToken);
    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.refreshToken).not.toBe(refreshToken);

    const reuseResponse = await refresh(refreshToken);
    expect(reuseResponse.status).toBe(401);
    expect(reuseResponse.body.code).toBe(ERROR_CODES.INVALID_REFRESH_TOKEN);

    expect((await refresh(refreshResponse.body.refreshToken)).status).toBe(401);
  });

  it('POST /auth/sign-out revokes the refresh token', async () => {
    const { accessToken, refreshToken } = (await signIn(ADMIN_EMAIL)).body;

    const signOutResponse = await request(app.getHttpServer())
      .post('/auth/sign-out')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken });
    expect(signOutResponse.status).toBe(204);

    expect((await refresh(refreshToken)).status).toBe(401);
  });

  it('GET /users/me requires an access token', async () => {
    const response = await request(app.getHttpServer()).get('/users/me');

    expect(response.status).toBe(401);
    expect(response.body.code).toBe(ERROR_CODES.UNAUTHORIZED);
  });
});
