import { NextResponse } from "next/server";
import { cancelGpuReservation, getGpuNameById, getReservationByIdAndUser } from "@/features/gpu/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { createEventLog } from "@/features/eventLog/data";
import { getServersNameById } from "@/features/server/data";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";

export async function PUT(req: Request) {
  try {
    const { t } = await getServerLanguage();

    const { userId } = await hasCategory();

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.unauthorized") },
        { status: 401 }
      );
    }

    const { reservationId } = await req.json();

    if (!reservationId || typeof reservationId !== "string") {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.missingReservationId") },
        { status: 400 }
      );
    }

    const reservation = await getReservationByIdAndUser(reservationId, userId);

    if (!reservation || !reservation.data) {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.reservationNotFound") },
        { status: 404 }
      );
    }

    if (reservation.data.status === "CANCELLED") {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.reservationAlreadyCancelled") },
        { status: 409 }
      );
    }

    const canceled = await cancelGpuReservation(reservationId);

    if (!canceled || !canceled.success) {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.cancelationError") },
        { status: 500 }
      );
    }

    const gpuName = await getGpuNameById(reservation.data.gpuId);

    if (!gpuName || !gpuName.success || !gpuName.data) {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.gpuNotFound") },
        { status: 404 }
      );
    }

    const serverName = await getServersNameById([reservation.data.serverId]);

    if (!serverName || !serverName.success || !serverName.data) {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.serverNotFound") },
        { status: 404 }
      );
    }

    const log = await createEventLog({
      eventType: "RESERVATION_CANCELLED",
      message: `EventLog.logMessage.reservation_cancelled|${gpuName.data.name}|${serverName.data[0].name}`,
      reservationId: reservationId,
      userId: userId,
      serverId: reservation.data.serverId,
    });

    if (!log || log.error) {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.eventLogError") },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: null, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PUT /api/gpu/cancelation:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
