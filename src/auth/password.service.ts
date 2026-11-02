import { Injectable } from '@nestjs/common';
import { hash, verify } from 'argon2';

import { ARGON2_OPTIONS, TIMING_SAFE_PLACEHOLDER_PASSWORD } from './auth.constants.js';

@Injectable()
export class PasswordService {
  private readonly placeholderHash = hash(TIMING_SAFE_PLACEHOLDER_PASSWORD, ARGON2_OPTIONS);

  hash(password: string): Promise<string> {
    return hash(password, ARGON2_OPTIONS);
  }

  async verify(passwordHash: string | undefined, password: string): Promise<boolean> {
    const isMatch = await verify(passwordHash ?? (await this.placeholderHash), password).catch(
      () => false,
    );
    return Boolean(passwordHash) && isMatch;
  }
}
