import {
  getServerByIdWithReservations,
  hasAccessToServer,
} from "@/features/server/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { updateGpuReservationStatuses } from "@/lib/services/reservations/updateStatus";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { t } = await getServerLanguage();

    await updateGpuReservationStatuses();

    const { searchParams } = new URL(request.url);
    const serverId = searchParams.get("serverId");

    if (!serverId || typeof serverId !== "string") {
      return NextResponse.json(
        { success: false, data: null, error: t("Server.Route.serverIdRequired") },
        { status: 400 }
      );
    }

    const { userId } = await hasCategory();

    if (!userId) {
      return NextResponse.json(
        { success: false, data: null, error: t("Server.Route.unauthorized") },
        { status: 401 }
      );
    }

    const server = await getServerByIdWithReservations(serverId);
    if (!server) {
      return NextResponse.json(
        { success: false, data: null, error: t("Server.Route.serverNotFound") },
        { status: 404 }
      );
    }

    const canAccess = await hasAccessToServer(userId, serverId);
    if (!canAccess) {
      return NextResponse.json(
        { success: false, data: null, error: t("Server.Route.accessDenied") },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: true, data: server, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/server/details:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
