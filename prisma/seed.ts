import { Category, EventType, PrismaClient, ReservationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const passwordPromise = process.env.SEED_USER_PASSWORD
  ? bcrypt.hash(process.env.SEED_USER_PASSWORD, 10)
  : bcrypt.hash('defaultPassword', 10);

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const HOUR_IN_MS = 60 * 60 * 1000;

const shiftDays = (baseDate: Date, days: number) => new Date(baseDate.getTime() + days * DAY_IN_MS);
const shiftHours = (baseDate: Date, hours: number) => new Date(baseDate.getTime() + hours * HOUR_IN_MS);

const buildReservationDates = (baseDate: Date, startOffsetDays: number, durationDays: number) => {
  const startDate = shiftDays(baseDate, startOffsetDays);
  const endDate = shiftDays(startDate, durationDays);

  return { startDate, endDate };
};

type SeedUser = {
  name: string;
  firstSurname: string;
  secondSurname?: string | null;
  email: string;
  category: Category;
  isActive?: boolean;
};

type CreatedUser = {
  id: string;
  name: string;
  email: string;
  category: Category;
  isActive: boolean;
};

const USER_BLUEPRINTS: SeedUser[] = [
  {
    name: 'Ada',
    firstSurname: 'Lovelace',
    secondSurname: 'Byron',
    email: 'admin@example.com',
    category: Category.ADMIN,
    isActive: true,
  },
  {
    name: 'Alice',
    firstSurname: 'Gomez',
    secondSurname: 'Martinez',
    email: 'researcher@example.com',
    category: Category.RESEARCHER,
    isActive: true,
  },
  {
    name: 'Clara',
    firstSurname: 'Perez',
    secondSurname: 'Ruiz',
    email: 'junior@example.com',
    category: Category.JUNIOR,
    isActive: true,
  },
  {
    name: 'Linus',
    firstSurname: 'Torvalds',
    email: 'linus.admin@example.com',
    category: Category.ADMIN,
    isActive: true,
  },
  {
    name: 'Marie',
    firstSurname: 'Curie',
    secondSurname: 'Sklodowska',
    email: 'marie.researcher@example.com',
    category: Category.RESEARCHER,
    isActive: true,
  },
  {
    name: 'Bruno',
    firstSurname: 'Rossi',
    secondSurname: 'Bianchi',
    email: 'bruno.researcher@example.com',
    category: Category.RESEARCHER,
    isActive: true,
  },
  {
    name: 'Sonia',
    firstSurname: 'Khan',
    email: 'sonia.researcher@example.com',
    category: Category.RESEARCHER,
    isActive: false,
  },
  {
    name: 'Daniel',
    firstSurname: 'Diaz',
    email: 'daniel.junior@example.com',
    category: Category.JUNIOR,
    isActive: true,
  },
  {
    name: 'Marta',
    firstSurname: 'Lopez',
    secondSurname: 'Ibarra',
    email: 'marta.junior@example.com',
    category: Category.JUNIOR,
    isActive: true,
  },
  {
    name: 'Nate',
    firstSurname: 'Young',
    email: 'nate.junior@example.com',
    category: Category.JUNIOR,
    isActive: false,
  },
  {
    name: 'Iris',
    firstSurname: 'Fernandez',
    secondSurname: 'Silva',
    email: 'iris.junior@example.com',
    category: Category.JUNIOR,
    isActive: true,
  },
  {
    name: 'Leo',
    firstSurname: 'Mendez',
    email: 'leo.junior@example.com',
    category: Category.JUNIOR,
    isActive: true,
  },
];

const SERVER_BLUEPRINTS = [
  { name: 'Cluster Atlas', ramGB: 256, diskCount: 4, available: true, gpuCount: 3 },
  { name: 'Cluster Boreal', ramGB: 192, diskCount: 3, available: true, gpuCount: 2 },
  { name: 'Cluster Cosmo', ramGB: 384, diskCount: 6, available: true, gpuCount: 4 },
  { name: 'Cluster Delta', ramGB: 128, diskCount: 2, available: false, gpuCount: 2 },
  { name: 'Cluster Eclipse', ramGB: 512, diskCount: 8, available: true, gpuCount: 5 },
];

const GPU_TYPES = [
  { type: 'NVIDIA H100', ramGB: 80 },
  { type: 'NVIDIA A100', ramGB: 40 },
  { type: 'NVIDIA L40S', ramGB: 48 },
  { type: 'NVIDIA RTX 6000 Ada', ramGB: 48 },
];

const reservationStatusCycle: ReservationStatus[] = [
  ReservationStatus.COMPLETED,
  ReservationStatus.ACTIVE,
  ReservationStatus.PENDING,
  ReservationStatus.CANCELLED,
  ReservationStatus.EXTENDED,
];

const pick = <T,>(items: T[], index: number) => items[index % items.length];

async function main() {
  await prisma.$transaction([
    prisma.userNotification.deleteMany(),
    prisma.eventLog.deleteMany(),
    prisma.gpuReservation.deleteMany(),
    prisma.userServerAccess.deleteMany(),
    prisma.gpu.deleteMany(),
    prisma.server.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const passwordHash = await passwordPromise;
  const now = new Date();

  await prisma.user.createMany({
    data: USER_BLUEPRINTS.map((user) => ({
      ...user,
      password: passwordHash,
      isActive: user.isActive ?? true,
    })),
  });

  const users = (await prisma.user.findMany({
    select: { id: true, name: true, email: true, category: true, isActive: true },
  })) as CreatedUser[];

  const usersByEmail = Object.fromEntries(users.map((user) => [user.email, user]));
  const admins = users.filter((user) => user.category === Category.ADMIN);
  const researchers = users.filter((user) => user.category === Category.RESEARCHER);
  const juniors = users.filter((user) => user.category === Category.JUNIOR);

  // Assign mentors to many juniors and keep at least one unassigned to cover null relationships.
  const mentorPairs = [
    ['junior@example.com', 'researcher@example.com'],
    ['daniel.junior@example.com', 'bruno.researcher@example.com'],
    ['marta.junior@example.com', 'marie.researcher@example.com'],
    ['iris.junior@example.com', 'researcher@example.com'],
  ] as const;

  for (const [juniorEmail, mentorEmail] of mentorPairs) {
    const junior = usersByEmail[juniorEmail];
    const mentor = usersByEmail[mentorEmail];

    if (junior && mentor) {
      await prisma.user.update({
        where: { id: junior.id },
        data: { assignedToId: mentor.id },
      });
    }
  }

  await prisma.server.createMany({
    data: SERVER_BLUEPRINTS.map(({ gpuCount: _gpuCount, ...server }) => server),
  });

  const servers = await prisma.server.findMany({ select: { id: true, name: true, available: true } });
  const serverIds = servers.map((server) => server.id);
  const availableServerIds = servers.filter((server) => server.available).map((server) => server.id);

  const gpus: Array<{ id: string; name: string; type: string; ramGB: number; serverId: string }> = [];

  for (const server of servers) {
    const gpuCount = SERVER_BLUEPRINTS.find((item) => item.name === server.name)?.gpuCount ?? 2;

    for (let index = 1; index <= gpuCount; index++) {
      const model = pick(GPU_TYPES, index - 1);
      const gpu = await prisma.gpu.create({
        data: {
          name: `${server.name} GPU ${index}`,
          type: model.type,
          ramGB: model.ramGB,
          serverId: server.id,
        },
      });

      gpus.push({ ...gpu, serverId: server.id });
    }
  }

  const assignAccess = async (userId: string, targetServerIds: string[]) => {
    for (const serverId of targetServerIds) {
      await prisma.userServerAccess.create({
        data: { userId, serverId },
      });
    }
  };

  for (const admin of admins) {
    await assignAccess(admin.id, serverIds);
  }

  for (let index = 0; index < researchers.length; index++) {
    const accessList = availableServerIds.filter((_, serverIndex) => (serverIndex + index) % 2 === 0);
    await assignAccess(researchers[index].id, accessList.length > 0 ? accessList : availableServerIds.slice(0, 1));
  }

  for (let index = 0; index < juniors.length; index++) {
    const targetServer = availableServerIds[index % availableServerIds.length];

    if (targetServer) {
      await assignAccess(juniors[index].id, [targetServer]);
    }
  }

  const createReservation = async ({
    userId,
    gpu,
    status,
    startOffsetDays,
    durationDays = 1,
  }: {
    userId: string;
    gpu: (typeof gpus)[number];
    status: ReservationStatus;
    startOffsetDays: number;
    durationDays?: number;
  }) => {
    const { startDate, endDate } = buildReservationDates(now, startOffsetDays, durationDays);
    const actualEndDate =
      status === ReservationStatus.CANCELLED
        ? shiftHours(startDate, 4)
        : status === ReservationStatus.EXTENDED
          ? shiftDays(endDate, 1)
          : endDate;

    return prisma.gpuReservation.create({
      data: {
        userId,
        gpuId: gpu.id,
        serverId: gpu.serverId,
        status,
        startDate,
        endDate,
        actualEndDate,
        extendedAt: status === ReservationStatus.EXTENDED ? shiftHours(endDate, -6) : null,
        extendedUntil: status === ReservationStatus.EXTENDED ? shiftDays(endDate, 1) : null,
        cancelledAt: status === ReservationStatus.CANCELLED ? shiftHours(startDate, 4) : null,
      },
    });
  };

  const reservationOwners = [...admins, ...researchers, ...juniors.filter((junior) => junior.isActive)];
  const reservations = [];

  for (let index = 0; index < 45; index++) {
    const user = pick(reservationOwners, index);
    const gpu = pick(gpus, index);
    const status = pick(reservationStatusCycle, index);

    const reservation = await createReservation({
      userId: user.id,
      gpu,
      status,
      startOffsetDays: -15 + index,
      durationDays: (index % 4) + 1,
    });

    reservations.push(reservation);
  }

  const createEventLogWithNotifications = async ({
    userId = null,
    serverId = null,
    reservationId = null,
    eventType,
    message,
    createdAt,
    markAsReadForIds = [],
  }: {
    userId?: string | null;
    serverId?: string | null;
    reservationId?: string | null;
    eventType: EventType;
    message: string;
    createdAt?: Date;
    markAsReadForIds?: string[];
  }) => {
    const log = await prisma.eventLog.create({
      data: {
        userId,
        serverId,
        reservationId,
        eventType,
        message,
        ...(createdAt ? { createdAt } : {}),
      },
    });

    const recipients = new Set<string>();

    if (userId) {
      recipients.add(userId);
    }

    if (serverId) {
      const accesses = await prisma.userServerAccess.findMany({
        where: { serverId },
        select: { userId: true },
      });

      for (const access of accesses) {
        recipients.add(access.userId);
      }
    }

    for (const recipientId of recipients) {
      const notification = await prisma.userNotification.create({
        data: {
          userId: recipientId,
          eventLogId: log.id,
        },
      });

      if (markAsReadForIds.includes(recipientId)) {
        await prisma.userNotification.update({
          where: { id: notification.id },
          data: { isRead: true },
        });
      }
    }

    return log;
  };

  const eventTimeline: Array<{
    userId?: string | null;
    serverId?: string | null;
    reservationId?: string | null;
    eventType: EventType;
    message: string;
    createdAt: Date;
    markAsReadForIds?: string[];
  }> = [
      {
        userId: usersByEmail['admin@example.com']?.id,
        eventType: EventType.USER_CREATED,
        message: 'Se creo el usuario administrador principal.',
        createdAt: shiftDays(now, -20),
        markAsReadForIds: [usersByEmail['admin@example.com']?.id].filter(Boolean) as string[],
      },
      {
        userId: usersByEmail['researcher@example.com']?.id,
        eventType: EventType.USER_UPDATED,
        message: 'Perfil de investigadora actualizado con nueva linea de trabajo.',
        createdAt: shiftDays(now, -19),
      },
      {
        userId: usersByEmail['sonia.researcher@example.com']?.id,
        eventType: EventType.USER_DEACTIVATED,
        message: 'Cuenta desactivada temporalmente por inactividad.',
        createdAt: shiftDays(now, -18),
      },
      {
        userId: usersByEmail['nate.junior@example.com']?.id,
        eventType: EventType.USER_REACTIVATED,
        message: 'Cuenta junior reactivada para nuevo trimestre.',
        createdAt: shiftDays(now, -17),
      },
      {
        userId: usersByEmail['junior@example.com']?.id,
        eventType: EventType.USER_ASSIGNED_MENTOR,
        message: 'Clara fue asignada a Alice como mentora.',
        createdAt: shiftDays(now, -16),
      },
      {
        userId: usersByEmail['researcher@example.com']?.id,
        serverId: servers[0]?.id,
        eventType: EventType.USER_GRANTED_SERVER_ACCESS,
        message: 'Alice recibio acceso al Cluster Atlas.',
        createdAt: shiftDays(now, -15),
      },
      {
        userId: usersByEmail['nate.junior@example.com']?.id,
        serverId: servers[1]?.id,
        eventType: EventType.USER_REVOKED_SERVER_ACCESS,
        message: 'Se revoco acceso por rotacion de proyecto.',
        createdAt: shiftDays(now, -14),
      },
      {
        userId: usersByEmail['admin@example.com']?.id,
        serverId: servers[2]?.id,
        eventType: EventType.SERVER_CREATED,
        message: 'Cluster Cosmo quedo disponible.',
        createdAt: shiftDays(now, -13),
      },
      {
        userId: usersByEmail['admin@example.com']?.id,
        serverId: servers[3]?.id,
        eventType: EventType.SERVER_UNAVAILABLE,
        message: 'Cluster Delta entro en mantenimiento.',
        createdAt: shiftDays(now, -12),
      },
      {
        userId: usersByEmail['admin@example.com']?.id,
        serverId: servers[4]?.id,
        eventType: EventType.SERVER_UPDATED,
        message: 'Cluster Eclipse incremento capacidad de disco.',
        createdAt: shiftDays(now, -11),
      },
      {
        userId: usersByEmail['admin@example.com']?.id,
        serverId: servers[0]?.id,
        eventType: EventType.SERVER_AVAILABLE,
        message: 'Cluster Atlas quedo operativo tras reinicio.',
        createdAt: shiftDays(now, -10),
      },
      {
        userId: usersByEmail['admin@example.com']?.id,
        serverId: servers[1]?.id,
        eventType: EventType.SERVER_DELETED,
        message: 'Registro logico de servidor legado eliminado.',
        createdAt: shiftDays(now, -9),
      },
      {
        userId: usersByEmail['researcher@example.com']?.id,
        serverId: reservations[8]?.serverId,
        reservationId: reservations[8]?.id,
        eventType: EventType.RESERVATION_CREATED,
        message: 'Nueva reserva creada para pruebas de inferencia.',
        createdAt: shiftDays(now, -8),
      },
      {
        userId: usersByEmail['bruno.researcher@example.com']?.id,
        serverId: reservations[9]?.serverId,
        reservationId: reservations[9]?.id,
        eventType: EventType.RESERVATION_AVAILABLE,
        message: 'Ventana de disponibilidad detectada para Bruno.',
        createdAt: shiftDays(now, -7),
      },
      {
        userId: usersByEmail['admin@example.com']?.id,
        serverId: reservations[4]?.serverId,
        reservationId: reservations[4]?.id,
        eventType: EventType.RESERVATION_EXTENDED,
        message: 'Reserva extendida por alta carga de trabajo.',
        createdAt: shiftDays(now, -6),
      },
      {
        userId: usersByEmail['junior@example.com']?.id,
        serverId: reservations[3]?.serverId,
        reservationId: reservations[3]?.id,
        eventType: EventType.RESERVATION_CANCELLED,
        message: 'Reserva cancelada por cambio de prioridades.',
        createdAt: shiftDays(now, -5),
      },
      {
        userId: usersByEmail['marie.researcher@example.com']?.id,
        serverId: reservations[0]?.serverId,
        reservationId: reservations[0]?.id,
        eventType: EventType.RESERVATION_COMPLETED,
        message: 'Ejecucion completada con resultados validados.',
        createdAt: shiftDays(now, -4),
        markAsReadForIds: [usersByEmail['marie.researcher@example.com']?.id, usersByEmail['admin@example.com']?.id].filter(
          Boolean,
        ) as string[],
      },
      {
        userId: usersByEmail['linus.admin@example.com']?.id,
        eventType: EventType.USER_DELETED,
        message: 'Cuenta de prueba eliminada del sistema.',
        createdAt: shiftDays(now, -3),
      },
    ];

  const noisyMessages = [
    'Ejecucion nocturna iniciada.',
    'Se detecto uso intensivo de memoria.',
    'Usuario confirmo resultados experimentales.',
    'Se aplico ventana de mantenimiento.',
    'Se detecto capacidad disponible para nuevas reservas.',
  ];

  // Extra events for pagination, ordering and filtering scenarios.
  for (let index = 0; index < 70; index++) {
    const user = pick(users, index);
    const server = pick(servers, index);
    const reservation = pick(reservations, index);
    const eventType = pick(Object.values(EventType), index);

    eventTimeline.push({
      userId: index % 6 === 0 ? null : user.id,
      serverId: index % 5 === 0 ? null : server.id,
      reservationId:
        eventType.toString().startsWith('RESERVATION_') && index % 4 !== 0
          ? reservation.id
          : null,
      eventType,
      message: `${pick(noisyMessages, index)} [${index + 1}]`,
      createdAt: shiftHours(now, -200 + index * 3),
      markAsReadForIds: index % 3 === 0 ? [user.id] : [],
    });
  }

  for (const entry of eventTimeline) {
    await createEventLogWithNotifications(entry);
  }

  const totals = {
    users: await prisma.user.count(),
    servers: await prisma.server.count(),
    gpus: await prisma.gpu.count(),
    accesses: await prisma.userServerAccess.count(),
    reservations: await prisma.gpuReservation.count(),
    eventLogs: await prisma.eventLog.count(),
    notifications: await prisma.userNotification.count(),
  };

  console.log('Seed completado con exito.');
  console.table(totals);
}

main()
  .catch((error) => {
    console.error('Error en seed:', error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
