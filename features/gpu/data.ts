import { gpuName, reservationSummary, reservationSummaryWithExtendedUntil, reservationSummaryWithServerAndGpu } from "@/features/gpu/types";
import { db } from "@/lib/db";
import { ApiResponse } from "@/lib/types/BDResponse.types";

export const existGpusByIdsAndServer = async (
  selectedGpuIds: string[],
  serverId: string
): Promise<ApiResponse<boolean>> => {
  try {
    const gpus = await db.gpu.findMany({
      where: { id: { in: selectedGpuIds }, serverId },
    });

    const allExist = gpus.length === selectedGpuIds.length;

    return { success: true, data: allExist, error: null };
  } catch (error) {
    console.error("Error fetching GPUs:", error);
    return { success: false, data: false, error };
  }
};

export const getOverlappingReservations = async (
  selectedGpuIds: string[],
  startDate: Date,
  endDate: Date
): Promise<ApiResponse<boolean>> => {
  try {
    const reservations = await db.gpuReservation.findMany({
      where: {
        gpuId: { in: selectedGpuIds },
        status: { in: ["PENDING", "ACTIVE", "EXTENDED"] },
        startDate: { lt: endDate },
      },
      select: {
        startDate: true,
        endDate: true,
        extendedUntil: true,
      },
    });

    const hasOverlap = reservations.some((res) => {
      const effectiveEnd = res.extendedUntil ?? res.endDate ?? new Date(0);
      return res.startDate !== null && startDate < effectiveEnd && endDate > res.startDate;
    });

    return { success: true, data: hasOverlap, error: null };
  } catch (error) {
    console.error("Error checking overlapping reservations:", error);
    return { success: false, data: false, error };
  }
};

export const createGpuReservations = async (
  selectedGpuIds: string[],
  userId: string,
  serverId: string,
  startDate: Date,
  endDate: Date
): Promise<ApiResponse<reservationSummary[] | null>> => {
  try {
    const reservations = await db.$transaction(
      selectedGpuIds.map((gpuId) =>
        db.gpuReservation.create({
          data: {
            userId,
            gpuId,
            serverId,
            startDate,
            endDate,
            actualEndDate: endDate,
            status: "PENDING",
          },
        })
      )
    );
    return { success: true, data: reservations, error: null };
  } catch (error) {
    console.error("Error creating GPU reservations:", error);
    return { success: false, data: [], error };
  }
};

export const getActiveOrFutureUserReservations = async (
  userId: string
): Promise<ApiResponse<reservationSummaryWithServerAndGpu[] | null>> => {
  try {
    const reservations = await db.gpuReservation.findMany({
      where: {
        userId,
        status: { in: ["ACTIVE", "EXTENDED", "PENDING"] },
      },
      include: {
        server: {
          select: {
            id: true,
            name: true,
            ramGB: true,
            diskCount: true,
          },
        },
        gpu: {
          select: {
            id: true,
            name: true,
            type: true,
            ramGB: true,
          },
        },
      },
    });

    return {
      success: true,
      data: reservations,
      error: null,
    };
  } catch (error) {
    console.error("Error fetching user reservations:", error);
    return {
      success: false,
      data: null,
      error,
    };
  }
};

export const cancelGpuReservation = async (
  reservationId: string
): Promise<ApiResponse<null>> => {
  try {
    await db.gpuReservation.update({
      where: { id: reservationId },
      data: {
        status: "CANCELLED",
        actualEndDate: new Date(),
        cancelledAt: new Date(),
      },
    });

    return { success: true, data: null, error: null };
  } catch (error) {
    console.error("Error canceling GPU reservation:", error);
    return { success: false, data: null, error };
  }
};

export const getReservationByIdAndUser = async (
  reservationId: string,
  userId: string
): Promise<ApiResponse<reservationSummaryWithExtendedUntil | null>> => {
  try {
    const reservation = await db.gpuReservation.findUnique({
      where: { id: reservationId, userId },
      include: {
        gpu: true,
        server: true,
      },
    });

    if (!reservation) {
      return { success: false, data: null, error: "Reservation not found" };
    }

    const fixedReservation = reservation
      ? { ...reservation, extendedUntil: reservation.extendedUntil ?? undefined }
      : null;
    return { success: true, data: fixedReservation, error: null };
  } catch (error) {
    console.error("Error fetching reservation by ID and user:", error);
    return { success: false, data: null, error };
  }
};

export const extendGpuReservation = async (
  reservationId: string,
  extendedUntil: Date,
): Promise<ApiResponse<null>> => {
  try {
    await db.gpuReservation.update({
      where: { id: reservationId },
      data: {
        extendedUntil,
        status: "EXTENDED",
        extendedAt: new Date(),
      },
    });

    return { success: true, data: null, error: null };
  } catch (error) {
    console.error("Error extending GPU reservation:", error);
    return { success: false, data: null, error };
  }
};

export const getGpuNameById = async (
  id: string
): Promise<ApiResponse<gpuName | null>> => {
  try {
    const gpu = await db.gpu.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!gpu) {
      return { success: false, data: null, error: "GPU not found" };
    }

    return { success: true, data: gpu, error: null };
  } catch (error) {
    console.error("Error fetching GPU name by ID:", error);
    return { success: false, data: null, error };
  }
};