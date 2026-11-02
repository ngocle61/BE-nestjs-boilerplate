import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { DEMO_PASSWORD } from '../prisma/seed-data.js';
import { AppModule } from '../src/app.module.js';
import openaiConfig from '../src/config/openai.config.js';
import { CHAT_STREAM_PATH } from '../src/chat/chat.constants.js';
import { ERROR_CODES } from '../src/common/constants/error-codes.constants.js';

const STREAM_ENDPOINT = `/chat/${CHAT_STREAM_PATH}`;

describe('Chat (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let viewerToken: string;

  const signIn = (email: string) =>
    request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email, password: DEMO_PASSWORD })
      .then((response) => response.body.accessToken as string);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(openaiConfig.KEY)
      .useValue({ apiKey: undefined, model: 'gpt-4o-mini' })
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();

    adminToken = await signIn('admin@example.com');
    viewerToken = await signIn('viewer@example.com');
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects chat access from a viewer', async () => {
    const response = await request(app.getHttpServer())
      .get('/chat/conversation')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(response.status).toBe(403);
    expect(response.body.code).toBe(ERROR_CODES.FORBIDDEN);
  });

  it('creates the general conversation for the current user and reuses it on the next call', async () => {
    const first = await request(app.getHttpServer())
      .get('/chat/conversation')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(first.status).toBe(200);
    expect(first.body.interventionId).toBeNull();
    expect(Array.isArray(first.body.messages)).toBe(true);

    const second = await request(app.getHttpServer())
      .get('/chat/conversation')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(second.body.id).toBe(first.body.id);
  });

  it('scopes a conversation to a given intervention', async () => {
    const clientResponse = await request(app.getHttpServer())
      .post('/clients')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Chat E2E Client' });

    const interventionResponse = await request(app.getHttpServer())
      .post('/interventions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ clientId: clientResponse.body.id, type: 'Maintenance', durationMinutes: 60 });
    const interventionId = interventionResponse.body.id;

    const generalConversation = await request(app.getHttpServer())
      .get('/chat/conversation')
      .set('Authorization', `Bearer ${adminToken}`);

    const scopedConversation = await request(app.getHttpServer())
      .get('/chat/conversation')
      .query({ interventionId })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(scopedConversation.status).toBe(200);
    expect(scopedConversation.body.interventionId).toBe(interventionId);
    expect(scopedConversation.body.id).not.toBe(generalConversation.body.id);

    await request(app.getHttpServer())
      .delete(`/interventions/${interventionId}`)
      .set('Authorization', `Bearer ${adminToken}`);
  });

  it('returns a 404 for an unknown intervention', async () => {
    const response = await request(app.getHttpServer())
      .get('/chat/conversation')
      .query({ interventionId: '00000000-0000-4000-8000-000000000000' })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
    expect(response.body.code).toBe(ERROR_CODES.NOT_FOUND);
  });

  it('returns a clear error when the AI provider is not configured', async () => {
    const response = await request(app.getHttpServer())
      .post(STREAM_ENDPOINT)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ content: 'Hello there' });

    expect(response.status).toBe(503);
    expect(response.body.code).toBe(ERROR_CODES.AI_NOT_CONFIGURED);
  });

  it('exposes the stream on POST only', async () => {
    const response = await request(app.getHttpServer())
      .get(STREAM_ENDPOINT)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
  });
});
