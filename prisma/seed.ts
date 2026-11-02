import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'argon2';

import { ARGON2_OPTIONS } from '../src/auth/auth.constants.js';
import { PrismaClient } from '../src/generated/prisma/client.js';
import {
  buildDemoInterventions,
  DEMO_ADMIN_EMAIL,
  DEMO_CLIENTS,
  DEMO_PASSWORD,
  DEMO_TECHNICIAN_EMAILS,
  DEMO_USERS,
} from './seed-data.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env['DATABASE_URL'] }),
});

const seedDemoUsers = async () => {
  const passwordHash = await hash(DEMO_PASSWORD, ARGON2_OPTIONS);

  const users = await Promise.all(
    DEMO_USERS.map((user) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: { ...user, passwordHash },
      }),
    ),
  );

  return new Map(users.map((user) => [user.email, user.id]));
};

const seedDemoClients = () =>
  Promise.all(
    DEMO_CLIENTS.map((client) =>
      prisma.client.upsert({ where: { id: client.id }, update: {}, create: client }),
    ),
  );

const seedDemoInterventions = (technicianIds: string[], createdById: string) =>
  Promise.all(
    buildDemoInterventions(technicianIds).map((intervention) =>
      prisma.intervention.upsert({
        where: { id: intervention.id },
        update: {},
        create: { ...intervention, createdById },
      }),
    ),
  );

try {
  const userIdsByEmail = await seedDemoUsers();
  const technicianIds = DEMO_TECHNICIAN_EMAILS.map((email) => userIdsByEmail.get(email)!);

  await seedDemoClients();
  await seedDemoInterventions(technicianIds, userIdsByEmail.get(DEMO_ADMIN_EMAIL)!);
} finally {
  await prisma.$disconnect();
}
