import { createHash, randomBytes } from 'node:crypto';

import { BEARER_SCHEME, REFRESH_TOKEN_BYTES, TOKEN_HASH_ALGORITHM } from '../auth.constants.js';

export const createRefreshToken = (): string =>
  randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');

export const hashToken = (token: string): string =>
  createHash(TOKEN_HASH_ALGORITHM).update(token).digest('hex');

export const addDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

export const extractBearerToken = (authorization: string | undefined): string | null => {
  const [scheme, token] = authorization?.split(' ') ?? [];
  return scheme === BEARER_SCHEME && token ? token : null;
};
