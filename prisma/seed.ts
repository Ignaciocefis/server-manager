import { PrismaClient, Category, ReservationStatus, EventType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.create({
    data: {
      name: 'Admin',
      firstSurname: 'Root',
      email: 'admin@example.com',
      password: process.env.SEED_USER_PASSWORD || await bcrypt.hash("defaultPassword", 10),
      category: Category.ADMIN,
    },
  });

  const researcher1 = await prisma.user.create({
    data: {
      name: 'Alice',
      firstSurname: 'Researcher',
      email: 'alice@example.com',
      password: process.env.SEED_USER_PASSWORD || await bcrypt.hash("defaultPassword", 10),
      category: Category.RESEARCHER,
    },
  });

  const researcher2 = await prisma.user.create({
    data: {
      name: 'Bob',
      firstSurname: 'Researcher',
      email: 'bob@example.com',
      password: process.env.SEED_USER_PASSWORD || await bcrypt.hash("defaultPassword", 10),
      category: Category.RESEARCHER,
    },
  });

  const junior1 = await prisma.user.create({
    data: {
      name: 'Charlie',
      firstSurname: 'Junior',
      email: 'charlie@example.com',
      password: process.env.SEED_USER_PASSWORD || await bcrypt.hash("defaultPassword", 10),
      category: Category.JUNIOR,
      assignedToId: researcher1.id,
    },
  });

  const junior2 = await prisma.user.create({
    data: {
      name: 'Diana',
      firstSurname: 'Junior',
      email: 'diana@example.com',
      password: process.env.SEED_USER_PASSWORD || await bcrypt.hash("defaultPassword", 10),
      category: Category.JUNIOR,
      assignedToId: researcher2.id,
    },
  });

  const servers = await Promise.all([
    prisma.server.create({
      data: { name: 'Server A', ramGB: 128, diskCount: 2 },
    }),
    prisma.server.create({
      data: { name: 'Server B', ramGB: 256, diskCount: 3 },
    }),
    prisma.server.create({
      data: { name: 'Server C', ramGB: 512, diskCount: 4 },
    }),
  ]);

  const allGpus: Array<{ id: string; name: string; type: string; ramGB: number; serverId: string }> = [];
  for (const server of servers) {
    for (let i = 1; i <= 5; i++) {
      const gpu = await prisma.gpu.create({
        data: {
          name: `GPU-${server.name}-${i}`,
          type: 'NVIDIA A100',
          ramGB: 40,
          serverId: server.id,
        },
      });
      allGpus.push({ ...gpu, serverId: server.id });
    }
  }

  const assignAccess = async (userId: string, serverIds: string[]) => {
    for (const serverId of serverIds) {
      await prisma.userServerAccess.create({
        data: { userId, serverId },
      });
    }
  };

  await assignAccess(admin.id, servers.map((s) => s.id));
  await assignAccess(researcher1.id, [servers[0].id, servers[1].id]);
  await assignAccess(researcher2.id, [servers[2].id]);
  await assignAccess(junior1.id, [servers[0].id, servers[1].id]);
  await assignAccess(junior2.id, [servers[2].id]);

  const now = new Date();
  const day = (n: number) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

  const createReservation = async ({
    userId,
    gpu,
    status,
    offsetDays = 0,
  }: {
    userId: string;
    gpu: typeof allGpus[number];
    status: ReservationStatus;
    offsetDays?: number;
  }) => {
    return await prisma.gpuReservation.create({
      data: {
        userId,
        gpuId: gpu.id,
        serverId: gpu.serverId,
        status,
        startDate: day(offsetDays),
        endDate: day(offsetDays + 1),
        actualEndDate: day(offsetDays + 1),
        extendedAt: status === 'EXTENDED' ? day(offsetDays + 1) : null,
        extendedUntil: status === 'EXTENDED' ? day(offsetDays + 2) : null,
        cancelledAt: status === 'CANCELLED' ? day(offsetDays + 0.5) : null,
      },
    });
  };

  const statuses: ReservationStatus[] = ['PENDING', 'ACTIVE', 'EXTENDED', 'COMPLETED', 'CANCELLED'];

  if (allGpus.length < statuses.length + 8) {
    throw new Error('No hay suficientes GPUs para crear todas las reservas necesarias');
  }

  const reservations: Awaited<ReturnType<typeof prisma.gpuReservation.create>>[] = [];

  for (let i = 0; i < statuses.length; i++) {
    const r = await createReservation({
      userId: admin.id,
      gpu: allGpus[i],
      status: statuses[i],
      offsetDays: i,
    });
    reservations.push(r);
  }

  const restUsers = [researcher1, researcher2, junior1, junior2];
  let gpuIndex = statuses.length;

  for (const user of restUsers) {
    reservations.push(await createReservation({ userId: user.id, gpu: allGpus[gpuIndex++], status: 'ACTIVE' }));
    reservations.push(await createReservation({ userId: user.id, gpu: allGpus[gpuIndex++], status: 'PENDING' }));
  }

  const createEventLogWithNotifications = async ({
    userId = null,
    serverId = null,
    reservationId = null,
    eventType,
    message,
  }: {
    userId?: string | null;
    serverId?: string | null;
    reservationId?: string | null;
    eventType: EventType;
    message: string;
  }) => {
    const log = await prisma.eventLog.create({
      data: { userId, serverId, reservationId, eventType, message },
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
      for (const acc of accesses) {
        recipients.add(acc.userId);
      }
    }

    for (const uid of recipients) {
      await prisma.userNotification.create({
        data: {
          userId: uid,
          eventLogId: log.id,
        },
      });
    }

    return log;
  };

  const eventTypes: EventType[] = Object.values(EventType);

  for (const type of eventTypes) {
    await createEventLogWithNotifications({
      userId: admin.id,
      serverId: servers[0]?.id,
      reservationId: reservations[0]?.id,
      eventType: type,
      message: `Primer caso de ${type} registrado por Admin`,
    });

    await createEventLogWithNotifications({
      userId: researcher1.id,
      serverId: servers[1]?.id,
      reservationId: reservations[1]?.id,
      eventType: type,
      message: `Segundo caso de ${type} registrado por Alice`,
    });
  }

  console.log('Seed completado con éxito.');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
