import { NextResponse } from "next/server";
import {
  extendGpuReservation,
  getGpuNameById,
  getOverlappingReservations,
  getReservationByIdAndUser,
} from "@/features/gpu/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { createEventLog } from "@/features/eventLog/data";
import { getServersNameById } from "@/features/server/data";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";

export async function PUT(req: Request) {
  try {
    const { t } = await getServerLanguage();

    const { userId } = await hasCategory();

    if (!userId) {
      return NextResponse.json(
        { success: false, data: null, error: t("User.Route.unauthorized") },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { extendedUntil, reservationId } = body;

    if (!reservationId || typeof reservationId !== "string") {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.missingReservationId") },
        { status: 400 }
      );
    }

    if (!extendedUntil || isNaN(Date.parse(extendedUntil))) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: t("Gpu.Route.invalidExtendedUntil"),
        },
        { status: 400 }
      );
    }

    const extendedUntilDate = new Date(extendedUntil);

    const reservationResponse = await getReservationByIdAndUser(reservationId, userId);

    if (!reservationResponse.success) {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.errorFetchingReservation") },
        { status: 500 }
      );
    }

    const reservation = reservationResponse.data ?? null;

    if (!reservation) {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.reservationNotFound") },
        { status: 404 }
      );
    }

    if (["CANCELLED", "COMPLETED", "EXTENDED"].includes(reservation.status)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: t("Gpu.Route.cannotExtendCancelledCompletedOrExtended"),
        },
        { status: 400 }
      );
    }

    const currentEnd = reservation.extendedUntil ?? reservation.endDate;

    if (!currentEnd || extendedUntilDate <= currentEnd) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: t("Gpu.Route.extendedUntilMustBeAfterCurrentEnd"),
        },
        { status: 400 }
      );
    }

    const hasOverlap = await getOverlappingReservations(
      [reservation.gpuId],
      currentEnd,
      extendedUntilDate
    );

    if (!hasOverlap.success || hasOverlap.data) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: t("Gpu.Route.extensionOverlapsWithAnotherReservation"),
        },
        { status: 400 }
      );
    }

    const updated = await extendGpuReservation(reservationId, extendedUntilDate);

    if (!updated || !updated.success) {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.errorExtendingReservation") },
        { status: 500 }
      );
    }

    const gpuName = await getGpuNameById(reservation.gpuId);

    if (!gpuName || !gpuName.success || !gpuName.data) {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.gpuNotFound") },
        { status: 404 }
      );
    }

    const serverName = await getServersNameById([reservation.serverId]);

    if (!serverName || !serverName.success || !serverName.data) {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.serverNotFound") },
        { status: 404 }
      );
    }

    const log = await createEventLog({
      eventType: "RESERVATION_EXTENDED",
      message: `EventLog.logMessage.reservation_extended|${gpuName.data.name}|${serverName.data[0].name}|${new Date(extendedUntilDate).toLocaleString()}`,
      reservationId: reservationId,
      userId: userId,
      serverId: reservation.serverId,
    });

    if (!log || log.error) {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.errorCreatingEventLog") },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: updated, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PUT /api/gpu/extend:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
