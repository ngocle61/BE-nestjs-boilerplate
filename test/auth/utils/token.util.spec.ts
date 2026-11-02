import { describe, expect, it } from 'vitest';

import {
  addDays,
  createRefreshToken,
  extractBearerToken,
  hashToken,
} from '../../../src/auth/utils/token.util.js';

describe('token util', () => {
  it('creates unguessable url-safe refresh tokens', () => {
    const first = createRefreshToken();

    expect(first).not.toBe(createRefreshToken());
    expect(first).toMatch(/^[A-Za-z0-9_-]{64}$/);
  });

  it('hashes tokens deterministically without exposing the raw value', () => {
    const token = createRefreshToken();

    expect(hashToken(token)).toBe(hashToken(token));
    expect(hashToken(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashToken(token)).not.toContain(token);
  });

  it('adds whole days', () => {
    expect(addDays(new Date('2026-01-01T00:00:00.000Z'), 30).toISOString()).toBe(
      '2026-01-31T00:00:00.000Z',
    );
  });

  it('reads only bearer tokens', () => {
    expect(extractBearerToken('Bearer abc')).toBe('abc');
    expect(extractBearerToken('Basic abc')).toBeNull();
    expect(extractBearerToken(undefined)).toBeNull();
  });
});
