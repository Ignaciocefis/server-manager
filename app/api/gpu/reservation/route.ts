import { createEventLog } from "@/features/eventLog/data";
import {
  createGpuReservations,
  existGpusByIdsAndServer,
  getGpuNameById,
  getOverlappingReservations,
} from "@/features/gpu/data";
import { gpuReservationFormSchema } from "@/features/gpu/schemas";
import { getServersNameById, hasAccessToServer } from "@/features/server/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const { t } = await getServerLanguage();

    const body = await req.json();
    const data = gpuReservationFormSchema(t).parse(body);

    const { userId, isCategory } = await hasCategory("ADMIN");
    if (!userId) {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.unauthorized") },
        { status: 401 }
      );
    }

    if (data.startHour >= data.endHour) {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.theStartHourMustBeBeforeEndHour") },
        { status: 400 }
      );
    }

    const getDateTime = (date: Date, time: string) => {
      const [h, m] = time.split(":").map(Number);
      const dt = new Date(date);
      dt.setHours(h, m, 0, 0);
      return dt;
    };

    const truncateToMinutes = (date: Date) => {
      const d = new Date(date);
      d.setSeconds(0, 0);
      return d;
    };

    const startDate = truncateToMinutes(getDateTime(data.range.from, data.startHour));
    const endDate = truncateToMinutes(getDateTime(data.range.to, data.endHour));
    const now = truncateToMinutes(new Date());

    if (startDate >= endDate) {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.theStartHourMustBeBeforeEndHour") },
        { status: 400 }
      );
    }

    if (endDate <= now || startDate < now) {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.noReservationsInThePast") },
        { status: 400 }
      );
    }

    if (!isCategory) {
      const access = await hasAccessToServer(userId, data.serverId);
      if (!access) {
        return NextResponse.json(
          { success: false, data: null, error: t("Gpu.Route.noAccessToServer") },
          { status: 403 }
        );
      }
    }

    const gpuCheck = await existGpusByIdsAndServer(data.selectedGpuIds, data.serverId);
    if (!gpuCheck.success) {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.errorFetchingGpus"), details: gpuCheck.error },
        { status: 500 }
      );
    }
    if (!gpuCheck.data) {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.gpuNotFoundOrNotBelong") },
        { status: 400 }
      );
    }

    const overlapCheck = await getOverlappingReservations(data.selectedGpuIds, startDate, endDate);
    if (!overlapCheck.success) {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.errorOverlappingReservations"), details: overlapCheck.error },
        { status: 500 }
      );
    }
    if (overlapCheck.data) {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.gpuAlreadyReserved") },
        { status: 409 }
      );
    }

    const creation = await createGpuReservations(data.selectedGpuIds, userId, data.serverId, startDate, endDate);
    if (!creation.success) {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.errorCreatingReservation"), details: creation.error },
        { status: 500 }
      );
    }

    if (!creation.data || !creation.success) {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.errorCreatingReservation") },
        { status: 500 }
      );
    }

    for (const reservation of creation.data) {
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
        eventType: "RESERVATION_CREATED",
        message: `EventLog.logMessage.reservation_created|${gpuName.data.name}|${serverName.data[0].name}|${new Date(startDate).toLocaleString()}|${new Date(endDate).toLocaleString()}`,
        reservationId: reservation.id,
        userId: userId,
        serverId: reservation.serverId,
      });

      if (!log || log.error) {
        return NextResponse.json(
          { success: false, data: null, error: t("Gpu.Route.eventLogError") },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { success: true, data: null, error: null },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, data: null, error: error.errors },
        { status: 400 }
      );
    }

    console.error("Error in POST /api/gpu/reservation:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
