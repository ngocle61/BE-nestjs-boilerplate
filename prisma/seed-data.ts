import type { Prisma } from '../src/generated/prisma/client.js';
import { InterventionStatus, Role, TimeSlot } from '../src/generated/prisma/enums.js';

export const DEMO_PASSWORD = 'Password@123';

export const DEMO_ADMIN_EMAIL = 'admin@example.com';

interface DemoUser {
  email: string;
  fullName: string;
  role: Role;
  isActive?: boolean;
}

export const DEMO_USERS: readonly DemoUser[] = [
  { email: DEMO_ADMIN_EMAIL, fullName: 'Alex Nguyen', role: Role.ADMIN },
  { email: 'member@example.com', fullName: 'Morgan Tran', role: Role.MEMBER },
  { email: 'viewer@example.com', fullName: 'Taylor Le', role: Role.VIEWER },
  { email: 'jordan.pham@example.com', fullName: 'Jordan Pham', role: Role.MEMBER },
  { email: 'casey.vo@example.com', fullName: 'Casey Vo', role: Role.MEMBER },
  { email: 'riley.hoang@example.com', fullName: 'Riley Hoang', role: Role.MEMBER },
  { email: 'avery.dang@example.com', fullName: 'Avery Dang', role: Role.MEMBER },
  { email: 'quinn.bui@example.com', fullName: 'Quinn Bui', role: Role.MEMBER },
  { email: 'jamie.do@example.com', fullName: 'Jamie Do', role: Role.MEMBER },
  { email: 'sam.huynh@example.com', fullName: 'Sam Huynh', role: Role.ADMIN },
  { email: 'drew.ngo@example.com', fullName: 'Drew Ngo', role: Role.MEMBER, isActive: false },
  { email: 'parker.ly@example.com', fullName: 'Parker Ly', role: Role.VIEWER },
  { email: 'kai.truong@example.com', fullName: 'Kai Truong', role: Role.VIEWER },
];

export const DEMO_TECHNICIAN_EMAILS = DEMO_USERS.filter(
  (user) => user.role !== Role.VIEWER && user.isActive !== false,
).map((user) => user.email);

export const DEMO_CLIENTS = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Riverside Apartments',
    phone: '+1 555 0101',
    email: 'contact@riverside-apts.example',
    addressLine: '48 Riverside Drive',
    postalCode: '10023',
    city: 'New York',
  },
  {
    id: '11111111-1111-4111-8111-111111111112',
    name: 'Maple Street Office',
    phone: '+1 555 0102',
    email: 'facilities@maplestreet.example',
    addressLine: '210 Maple Street',
    postalCode: '10457',
    city: 'New York',
  },
  {
    id: '11111111-1111-4111-8111-111111111113',
    name: 'Harborview Clinic',
    phone: '+1 555 0103',
    email: 'ops@harborview.example',
    addressLine: '9 Harbor Way',
    postalCode: '10004',
    city: 'New York',
  },
  {
    id: '11111111-1111-4111-8111-111111111114',
    name: 'Greenfield School',
    phone: '+1 555 0104',
    email: 'admin@greenfield.example',
    addressLine: '77 Greenfield Road',
    postalCode: '11201',
    city: 'Brooklyn',
  },
  {
    id: '11111111-1111-4111-8111-111111111115',
    name: 'Sunset Bakery',
    phone: '+1 555 0105',
    email: 'hello@sunsetbakery.example',
    addressLine: '12 Sunset Boulevard',
    postalCode: '11215',
    city: 'Brooklyn',
  },
  {
    id: '11111111-1111-4111-8111-111111111116',
    name: 'Lakeside Hotel',
    phone: '+1 555 0106',
    email: 'maintenance@lakesidehotel.example',
    addressLine: '300 Lakeside Avenue',
    postalCode: '10128',
    city: 'New York',
  },
  {
    id: '11111111-1111-4111-8111-111111111117',
    name: 'Northpoint Warehouse',
    phone: '+1 555 0107',
    email: 'site@northpoint.example',
    addressLine: '5 Industrial Park Road',
    postalCode: '11101',
    city: 'Queens',
  },
  {
    id: '11111111-1111-4111-8111-111111111118',
    name: 'Oak Hill Residence',
    phone: '+1 555 0108',
    email: 'owner@oakhill.example',
    addressLine: '64 Oak Hill Lane',
    postalCode: '10301',
    city: 'Staten Island',
  },
  {
    id: '11111111-1111-4111-8111-111111111119',
    name: 'Central Pharmacy',
    phone: '+1 555 0109',
    email: 'store@centralpharmacy.example',
    addressLine: '150 Central Avenue',
    postalCode: '10002',
    city: 'New York',
  },
  {
    id: '11111111-1111-4111-8111-111111111120',
    name: 'Bayside Gym',
    phone: '+1 555 0110',
    email: 'front-desk@baysidegym.example',
    addressLine: '22 Bayside Parkway',
    postalCode: '11360',
    city: 'Queens',
  },
  {
    id: '11111111-1111-4111-8111-111111111121',
    name: 'Elm Court Condos',
    phone: '+1 555 0111',
    email: 'board@elmcourt.example',
    addressLine: '8 Elm Court',
    postalCode: '10463',
    city: 'Bronx',
  },
  {
    id: '11111111-1111-4111-8111-111111111122',
    name: 'Hudson Dental Care',
    phone: '+1 555 0112',
    email: 'office@hudsondental.example',
    addressLine: '410 Hudson Street',
    postalCode: '10014',
    city: 'New York',
  },
] as const;

const INTERVENTION_TYPES = [
  'Maintenance',
  'Repair',
  'Inspection',
  'Installation',
  'Follow-up',
  'Diagnostic',
] as const;

const DURATIONS_MINUTES = [45, 60, 90, 120] as const;

const NEIGHBOUR_DAYS = [-1, 1, 2] as const;

type DemoIntervention = Prisma.InterventionUncheckedCreateInput & { id: string };

const pick = <T>(items: readonly T[], index: number): T =>
  items[((index % items.length) + items.length) % items.length]!;

const daysFromNowAt = (days: number, hour: number, minute = 0): Date => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
};

const toInterventionId = (index: number) =>
  `22222222-2222-4222-8222-${String(index).padStart(12, '0')}`;

const statusFor = (days: number, technicianIndex: number) => {
  if (days < 0) {
    return technicianIndex % 4 === 1 ? InterventionStatus.CANCELLED : InterventionStatus.COMPLETED;
  }
  return InterventionStatus.SCHEDULED;
};

export const buildDemoInterventions = (technicianIds: readonly string[]): DemoIntervention[] => {
  const interventions: DemoIntervention[] = [];

  const addScheduled = (
    technicianIndex: number,
    days: number,
    slot: number,
    startsAt: Date,
    durationMinutes: number,
  ) => {
    const isUrgent = (technicianIndex + days + slot) % 5 === 0;
    interventions.push({
      id: toInterventionId(interventions.length + 1),
      clientId: pick(DEMO_CLIENTS, technicianIndex * 3 + slot + days).id,
      technicianId: technicianIds[technicianIndex]!,
      type: pick(INTERVENTION_TYPES, technicianIndex + slot * 2 + days),
      status: statusFor(days, technicianIndex),
      startsAt,
      durationMinutes,
      isUrgent,
      notes: isUrgent ? 'Urgent: confirm site access with the client before leaving.' : null,
    });
  };

  technicianIds.forEach((_, technicianIndex) => {
    const morningHour = 8 + (technicianIndex % 3);
    const morningMinute = (technicianIndex % 2) * 30;
    addScheduled(
      technicianIndex,
      0,
      0,
      daysFromNowAt(0, morningHour, morningMinute),
      pick(DURATIONS_MINUTES, technicianIndex),
    );

    const middayHour = 11 + (technicianIndex % 4);
    addScheduled(technicianIndex, 0, 1, daysFromNowAt(0, middayHour), 90);

    if (technicianIndex % 3 === 0) {
      addScheduled(technicianIndex, 0, 2, daysFromNowAt(0, middayHour, 30), 60);
    }

    NEIGHBOUR_DAYS.forEach((days) => {
      if ((technicianIndex + days) % 2 !== 0) return;
      addScheduled(
        technicianIndex,
        days,
        3,
        daysFromNowAt(days, 9 + pick([0, 1, 2, 4, 5, 6], technicianIndex + days)),
        pick(DURATIONS_MINUTES, technicianIndex + days),
      );
    });
  });

  const unscheduled: Omit<DemoIntervention, 'id'>[] = [
    {
      clientId: DEMO_CLIENTS[0].id,
      type: 'Follow-up',
      status: InterventionStatus.TO_SCHEDULE,
      durationMinutes: 60,
    },
    {
      clientId: DEMO_CLIENTS[2].id,
      type: 'Repair',
      status: InterventionStatus.AWAITING_CALLBACK,
      durationMinutes: 30,
      isUrgent: true,
      callbackAt: daysFromNowAt(0, 15),
      preferredSlot: TimeSlot.MORNING,
    },
    {
      clientId: DEMO_CLIENTS[5].id,
      type: 'Installation',
      status: InterventionStatus.TO_SCHEDULE,
      durationMinutes: 120,
    },
    {
      clientId: DEMO_CLIENTS[8].id,
      type: 'Inspection',
      status: InterventionStatus.AWAITING_CALLBACK,
      durationMinutes: 45,
      callbackAt: daysFromNowAt(1, 10),
      preferredSlot: TimeSlot.AFTERNOON,
    },
    {
      clientId: DEMO_CLIENTS[10].id,
      type: 'Maintenance',
      status: InterventionStatus.TO_SCHEDULE,
      durationMinutes: 90,
    },
  ];

  unscheduled.forEach((intervention) =>
    interventions.push({ ...intervention, id: toInterventionId(interventions.length + 1) }),
  );

  return interventions;
};
