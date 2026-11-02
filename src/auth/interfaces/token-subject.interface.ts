import type { User } from '../../generated/prisma/client.js';

export type TokenSubject = Pick<User, 'id' | 'role'>;
