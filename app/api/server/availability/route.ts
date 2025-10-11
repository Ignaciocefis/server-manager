import { NextResponse } from "next/server";
import { hasCategory } from "@/lib/auth/hasCategory";
import { changeServerAvailability, getServerByIdWithReservations } from "@/features/server/data";
import { createEventLog } from "@/features/eventLog/data";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
// import { sendEmailAvailabilityChange } from "@/lib/services/resend/serverAvailabilityChange/serverAvailabilityChange";

export async function PUT(request: Request) {
  try {
    const { t } = await getServerLanguage();

    const { isCategory } = await hasCategory("ADMIN");

    if (!isCategory) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: t("Server.Route.unauthorized"),
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { serverId } = body;

    if (!serverId || typeof serverId !== "string") {
      return NextResponse.json(
        { success: false, data: null, error: t("Server.Route.serverIdRequired") },
        { status: 400 }
      );
    }

    const updated = await changeServerAvailability(serverId);

    if (!updated.success || updated.error) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: updated?.error || t("Server.Route.updateServerError"),
        },
        { status: 500 }
      );
    }

    const updatedServer = await getServerByIdWithReservations(serverId);

    if (!updatedServer || updatedServer.error || !updatedServer.data) {
      return NextResponse.json(
        { success: false, data: null, error: t("Server.Route.serverNotFound") },
        { status: 404 }
      );
    }

    const log = await createEventLog({
      eventType: `${updated.data ? "SERVER_AVAILABLE" : "SERVER_UNAVAILABLE"}`,
      message: `EventLog.logMessage.server_${updated.data ? "available" : "unavailable"}|${updatedServer.data.name}`,
      serverId: serverId,
    });

    if (!log || log.error) {
      return NextResponse.json(
        { success: false, data: null, error: t("Server.Route.eventLogError") },
        { status: 500 }
      );
    }

    /**

    const usersWithAccess = await getAllUsersWithAccessToServer(serverId);

    if (!usersWithAccess || usersWithAccess.error) {
      return NextResponse.json(
        { success: false, data: null, error: "Error al obtener usuarios con acceso al servidor" },
        { status: 500 }
      );
    }
    
    for (const user of usersWithAccess.data) {
      try {
        await sendEmailAvailabilityChange(
          user.email,
          user.gpus,
          updatedServer.data?.name ?? "Servidor",
          updatedServer.data?.available ? "disponible" : "no disponible"
        );
      } catch (error) {
        console.error("Error al enviar correo de cambio de disponibilidad:", error);
      }
    }

    */

    return NextResponse.json(
      {
        success: true,
        data: updatedServer.data,
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PUT /api/server/availability:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
