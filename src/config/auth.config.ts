import { registerAs } from '@nestjs/config';
import { z } from 'zod';

import { parseEnv } from './config.util.js';

const authEnvSchema = z
  .object({
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(900),
    REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  })
  .transform((env) => ({
    jwtAccessSecret: env.JWT_ACCESS_SECRET,
    jwtAccessTtlSeconds: env.JWT_ACCESS_TTL_SECONDS,
    refreshTokenTtlDays: env.REFRESH_TOKEN_TTL_DAYS,
  }));

export default registerAs('auth', () => parseEnv(authEnvSchema));
