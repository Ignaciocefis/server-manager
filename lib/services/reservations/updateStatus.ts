import { db } from "@/lib/db";

export async function updateGpuReservationStatuses() {
  const now = new Date();

  const activate = await db.gpuReservation.updateMany({
    where: {
      status: "PENDING",
      startDate: { lte: now },
      endDate: { gte: now },
    },
    data: {
      status: "ACTIVE",
    },
  });

  const complete = await db.gpuReservation.updateMany({
    where: {
      status: { in: ["ACTIVE", "EXTENDED"] },
      endDate: { lt: now },
    },
    data: {
      status: "COMPLETED",
    },
  });

  return {
    activated: activate.count,
    completed: complete.count,
  };
}
