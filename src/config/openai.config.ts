import { registerAs } from '@nestjs/config';
import { z } from 'zod';

import { parseEnv } from './config.util.js';

export const REASONING_EFFORTS = ['none', 'minimal', 'low', 'medium', 'high'] as const;

const openaiEnvSchema = z
  .object({
    OPENAI_API_KEY: z.string().min(1).optional(),
    OPENAI_MODEL: z.string().min(1).default('gpt-4o-mini'),
    OPENAI_BASE_URL: z.url().optional(),
    OPENAI_REASONING_EFFORT: z.enum(REASONING_EFFORTS).optional(),
  })
  .transform((env) => ({
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
    baseUrl: env.OPENAI_BASE_URL,
    reasoningEffort: env.OPENAI_REASONING_EFFORT,
  }));

export default registerAs('openai', () => parseEnv(openaiEnvSchema));
