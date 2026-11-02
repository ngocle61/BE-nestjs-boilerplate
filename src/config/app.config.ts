import { registerAs } from '@nestjs/config';
import { z } from 'zod';

import { NODE_ENVS } from './config.constants.js';
import { parseEnv } from './config.util.js';

const appEnvSchema = z
  .object({
    NODE_ENV: z.enum(NODE_ENVS).default(NODE_ENVS.DEVELOPMENT),
    PORT: z.coerce.number().int().positive().default(3001),
    API_PREFIX: z.string().min(1).default('api'),
    CORS_ORIGINS: z.string().default('http://localhost:3000'),
  })
  .transform((env) => ({
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    apiPrefix: env.API_PREFIX,
    corsOrigins: env.CORS_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  }));

export default registerAs('app', () => parseEnv(appEnvSchema));
