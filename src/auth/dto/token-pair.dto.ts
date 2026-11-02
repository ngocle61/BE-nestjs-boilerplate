import { z } from 'zod';

export const tokenPairSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string(),
  })
  .meta({ id: 'TokenPair' });

export type TokenPairDto = z.infer<typeof tokenPairSchema>;
