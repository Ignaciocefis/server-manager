import { db } from "@/lib/db";

export const getGpusByIdsAndServer = async (selectedGpuIds: string[], serverId: string) => {
  try {
    return await db.gpu.findMany({
      where: { id: { in: selectedGpuIds }, serverId },
    });
  } catch (error) {
    console.error("Error fetching GPUs:", error);
    throw new Error("Error fetching GPUs");
  }
}

export const getOverlappingReservations = async (
  selectedGpuIds: string[],
  startDate: Date,
  endDate: Date
): Promise<boolean> => {
  try {
    const reservations = await db.gpuReservation.findMany({
      where: {
        gpuId: { in: selectedGpuIds },
        status: { in: ["PENDING", "ACTIVE", "EXTENDED"] },
        startTime: { lt: endDate },
      },
      select: {
        startTime: true,
        endTime: true,
        extendedUntil: true,
      },
    });

    return reservations.some((res) => {
      const effectiveEnd = res.extendedUntil ?? res.endTime ?? new Date(0);
      return res.startTime !== null && startDate < effectiveEnd && endDate > res.startTime;
    });
  } catch (error) {
    console.error("Error checking overlapping reservations:", error);
    throw new Error("Error checking overlapping reservations");
  }
};

export const createGpuReservations = async (selectedGpuIds: string[], userId: string, serverId: string, startDate: Date, endDate: Date) => {
  try {
    return await db.$transaction(
      selectedGpuIds.map((gpuId) =>
        db.gpuReservation.create({
          data: {
            userId,
            gpuId,
            serverId,
            startTime: startDate,
            endTime: endDate,
            status: "PENDING",
          },
        })
      )
    );
  } catch (error) {
    console.error("Error creating GPU reservations:", error);
    throw new Error("Error creating GPU reservations");
  }
}

export const getActiveOrFutureUserReservations = async (userId: string) => {
  try {
    return await db.gpuReservation.findMany({
      where: { userId, status: { in: ["ACTIVE", "EXTENDED", "PENDING"] } },
      include: {
        server: {
          select: {
            name: true,
            ramGB: true,
            diskCount: true,
          },
        },
        gpu: {
          select: {
            name: true,
            type: true,
            ramGB: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user reservations:", error);
    throw new Error("Error fetching user reservations");
  }
};

export const cancelGpuReservation = async (reservationId: string) => {
  try {
    await db.gpuReservation.update({
          where: { id: reservationId },
          data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
          },
        });
  } catch (error) {
    console.error("Error canceling GPU reservation:", error);
    throw new Error("Error canceling GPU reservation");
  }
}

export const getReservationByIdAndUser = async (reservationId: string, userId: string) => {
  try {
    return await db.gpuReservation.findUnique({
      where: { id: reservationId, userId },
      include: {
        gpu: true,
        server: true,
      },
    });
  } catch (error) {
    console.error("Error fetching reservation by ID and user:", error);
    throw new Error("Error fetching reservation by ID and user");
  }
}