import { z } from 'zod';

import { userResponseSchema } from '../../users/dto/user-response.dto.js';
import { tokenPairSchema } from './token-pair.dto.js';

export const signInResponseSchema = tokenPairSchema
  .extend({ user: userResponseSchema })
  .meta({ id: 'SignInResponse' });

export type SignInResponseDto = z.infer<typeof signInResponseSchema>;
