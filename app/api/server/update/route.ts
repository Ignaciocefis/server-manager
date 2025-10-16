import { createEventLog } from "@/features/eventLog/data";
import { existsServerByName, getServerById, updateServerWithGpus } from "@/features/server/data";
import { updateServerFormSchema } from "@/features/server/shemas";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const { t } = await getServerLanguage();

    const { isCategory } = await hasCategory("ADMIN");

    if (!isCategory) {
      return NextResponse.json(
        { success: false, data: null, error: t("Server.Route.accessDenied") },
        { status: 403 }
      );
    }


    const body = await request.json();
    const data = updateServerFormSchema(t).parse(body);
    const { serverId, ...serverData } = data;

    if (!serverId || typeof serverId !== "string") {
      return NextResponse.json(
        { success: false, data: null, error: t("Server.Route.invalidServerId") },
        { status: 400 }
      );
    }

    const existingServer = await getServerById(serverId);
    if (!existingServer || !existingServer.data) {
      return NextResponse.json(
        { success: false, data: null, error: t("Server.Route.serverNotFound") },
        { status: 404 }
      );
    }

    if (existingServer.data.name !== serverData.name) {
      const nameExists = await existsServerByName(serverData.name);
      if (!nameExists || nameExists.data) {
        return NextResponse.json(
          { success: false, data: null, error: t("Server.Route.serverNameExists") },
          { status: 409 }
        );
      }
    }

    const updatedServer = await updateServerWithGpus(data);

    if (!updatedServer || !updatedServer.success || !updatedServer.data) {
      return NextResponse.json(
        { success: false, data: null, error: t("Server.Route.updateServerError") },
        { status: 500 }
      );
    }

    const log = await createEventLog({
      eventType: "SERVER_UPDATED",
      message: `EventLog.logMessage.server_updated|${updatedServer.data.name}`,
      serverId: serverId,
    });

    if (!log || log.error) {
      return NextResponse.json(
        { success: false, data: null, error: t("Server.Route.eventLogError") },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedServer.data,
        error: null,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in PUT /api/server/update:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
