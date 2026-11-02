import { argon2id } from 'argon2';

export const ARGON2_OPTIONS = {
  type: argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

export const TIMING_SAFE_PLACEHOLDER_PASSWORD = 'timing-safe-placeholder-password';

export const BEARER_SCHEME = 'Bearer';

export const REFRESH_TOKEN_BYTES = 48;

export const TOKEN_HASH_ALGORITHM = 'sha256';

export const MAX_EMAIL_LENGTH = 254;

export const MAX_PASSWORD_LENGTH = 128;
