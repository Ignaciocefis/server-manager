import { db } from "@/lib/db";

export async function updateGpuReservationStatuses() {
  const now = new Date();

  const toActivate = await db.gpuReservation.findMany({
    where: {
      status: "PENDING",
      startDate: { lte: now },
      endDate: { gte: now },
    }, select: {
      id: true,
      serverId: true,
      userId: true,
      status: true,
      startDate: true,
      actualEndDate: true,
      gpu: true,
      server: true,
    }
  });

  for (const reservation of toActivate) {
    await db.gpuReservation.update({
      where: { id: reservation.id },
      data: { status: "ACTIVE" },
    });
    await db.eventLog.create({
      data: {
        reservationId: reservation.id,
        eventType: "RESERVATION_AVAILABLE",
        message: `La reserva de GPU ${reservation.gpu.name} del servidor ${reservation.server.name} está ahora disponible.`,
        userId: reservation.userId,
        serverId: reservation.serverId,
        createdAt: reservation.startDate,
      },
    });
  }

  const toComplete = await db.gpuReservation.findMany({
    where: {
      status: { in: ["ACTIVE", "EXTENDED"] },
      endDate: { lt: now },
    },
    select: {
      id: true,
      userId: true,
      serverId: true,
      gpu: true,
      server: true,
      startDate: true,
      endDate: true,
    },
  });

  for (const reservation of toComplete) {
    await db.gpuReservation.update({
      where: { id: reservation.id },
      data: { status: "COMPLETED" }
    });
    await db.eventLog.create({
      data: {
        reservationId: reservation.id,
        eventType: "RESERVATION_COMPLETED",
        message: `La reserva de GPU ${reservation.gpu.name} del servidor ${reservation.server.name} ha sido completada.`,
        userId: reservation.userId,
        serverId: reservation.serverId,
        createdAt: reservation.endDate,
      },
    });
  }

  return {
    activated: toActivate.length,
    completed: toComplete.length,
  };
}
