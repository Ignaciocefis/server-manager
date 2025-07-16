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

export const getOverlappingReservations = async (selectedGpuIds: string[], startDate: Date, endDate: Date) => {
  try {
    return await db.gpuReservation.findMany({
      where: {
        gpuId: { in: selectedGpuIds },
        startTime: { lt: endDate },
        endTime: { gt: startDate },
        status: { in: ["PENDING", "ACTIVE", "EXTENDED"] },
      },
    });
  } catch (error) {
    console.error("Error checking overlapping reservations:", error);
    throw new Error("Error checking overlapping reservations");
  }
}

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
