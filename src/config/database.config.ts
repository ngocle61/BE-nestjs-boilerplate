import { registerAs } from '@nestjs/config';
import { z } from 'zod';

import { parseEnv } from './config.util.js';

const databaseEnvSchema = z
  .object({
    DATABASE_URL: z.url(),
  })
  .transform((env) => ({
    url: env.DATABASE_URL,
  }));

export default registerAs('database', () => parseEnv(databaseEnvSchema));
