import type { ConfigType } from '@nestjs/config';
import { describe, expect, it, vi } from 'vitest';

import type openaiConfig from '../../src/config/openai.config.js';
import { AiNotConfiguredException } from '../../src/chat/exceptions/ai-not-configured.exception.js';
import { AiServiceUnavailableException } from '../../src/chat/exceptions/ai-service-unavailable.exception.js';
import { OpenaiService } from '../../src/chat/openai.service.js';

const { createCompletion, OpenAIClient, UserAbortError } = vi.hoisted(() => {
  const create = vi.fn();
  class AbortError extends Error {}
  const client = vi.fn(function OpenAIClient() {
    return { chat: { completions: { create } } };
  });
  Object.assign(client, { APIUserAbortError: AbortError });
  return { createCompletion: create, OpenAIClient: client, UserAbortError: AbortError };
});

vi.mock('openai', () => ({ default: OpenAIClient }));

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/';
const HISTORY = [{ role: 'user' as const, content: 'Hello' }];

const createService = (overrides: Partial<ConfigType<typeof openaiConfig>> = {}) =>
  new OpenaiService({
    apiKey: 'test-key',
    model: 'gpt-4o-mini',
    baseUrl: undefined,
    reasoningEffort: undefined,
    ...overrides,
  });

const toChunk = (content: string) => ({ choices: [{ delta: { content } }] });

const mockStream = (chunks: unknown[], failure?: Error) => {
  createCompletion.mockResolvedValue({
    async *[Symbol.asyncIterator]() {
      for (const chunk of chunks) yield chunk;
      if (failure) throw failure;
    },
  });
};

const collect = async (stream: AsyncGenerator<string>): Promise<string[]> => {
  const deltas: string[] = [];
  for await (const delta of stream) deltas.push(delta);
  return deltas;
};

const streamOf = (service: OpenaiService) =>
  service.streamReply(HISTORY, undefined, new AbortController().signal);

describe('OpenaiService', () => {
  it('refuses to answer when no API key is configured', async () => {
    const service = createService({ apiKey: undefined });

    await expect(collect(streamOf(service))).rejects.toBeInstanceOf(AiNotConfiguredException);
    expect(OpenAIClient).not.toHaveBeenCalled();
  });

  it('sends requests to the configured OpenAI-compatible base URL', () => {
    createService({ baseUrl: GEMINI_BASE_URL });

    expect(OpenAIClient).toHaveBeenCalledWith({ apiKey: 'test-key', baseURL: GEMINI_BASE_URL });
  });

  it('yields every non-empty content delta in order', async () => {
    mockStream([toChunk('Xin'), { choices: [{ delta: {} }] }, toChunk(' chào')]);

    await expect(collect(streamOf(createService()))).resolves.toEqual(['Xin', ' chào']);
  });

  it('asks the provider to stream and passes the abort signal', async () => {
    mockStream([toChunk('Hi')]);
    const controller = new AbortController();

    await collect(createService().streamReply(HISTORY, undefined, controller.signal));

    expect(createCompletion.mock.lastCall?.[0]).toMatchObject({ stream: true });
    expect(createCompletion.mock.lastCall?.[1]).toEqual({ signal: controller.signal });
  });

  it('passes the reasoning effort only when it is configured', async () => {
    mockStream([toChunk('Hi')]);

    await collect(streamOf(createService({ reasoningEffort: 'none' })));
    expect(createCompletion.mock.lastCall?.[0]).toMatchObject({ reasoning_effort: 'none' });

    await collect(streamOf(createService()));
    expect(createCompletion.mock.lastCall?.[0]).not.toHaveProperty('reasoning_effort');
  });

  it('keeps the deltas produced before the caller aborted', async () => {
    mockStream([toChunk('Half a sen')], new UserAbortError('aborted'));

    await expect(collect(streamOf(createService()))).resolves.toEqual(['Half a sen']);
  });

  it('reports provider failures as a service outage', async () => {
    mockStream([toChunk('Half a sen')], new Error('provider exploded'));

    await expect(collect(streamOf(createService()))).rejects.toBeInstanceOf(
      AiServiceUnavailableException,
    );
  });
});
