import { createEventLog } from "@/features/eventLog/data";
import { assignServersToUser, getServersNameById } from "@/features/server/data";
import { getUserNameById } from "@/features/user/data";
import { getFullName } from "@/features/user/utils";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const { t } = await getServerLanguage();

    const { userId: requesterId, isCategory } = await hasCategory(["ADMIN", "RESEARCHER"]);

    if (!requesterId || !isCategory) {
      return NextResponse.json(
        { success: false, data: null, error: t("Server.Route.unauthorized") },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId: targetUserId, serverIds } = body;

    if (!targetUserId || !Array.isArray(serverIds) || serverIds.some(id => typeof id !== "string")) {
      return NextResponse.json(
        { success: false, data: null, error: t("Server.Route.invalidFields") },
        { status: 400 }
      );
    }

    const result = await assignServersToUser(targetUserId, serverIds);

    if (!result.success || !result.data?.removed || result.error) {
      return NextResponse.json(
        { success: false, data: null, error: result.error || t("Server.Route.assignError") },
        { status: 500 }
      );
    }

    const userName = await getUserNameById(targetUserId);

    if (userName.error || !userName.success || !userName.data) {
      return NextResponse.json(
        { data: null, success: false, error: t("User.Route.userNotFound") },
        { status: 404 }
      );
    }

    const userFullName = getFullName(
      userName.data.firstSurname ?? undefined,
      userName.data.secondSurname ?? undefined,
      userName.data.name ?? undefined
    );

    const serverNames = await getServersNameById(serverIds);

    if (serverNames.error || !serverNames.success || !serverNames.data) {
      return NextResponse.json(
        { data: null, success: false, error: t("Server.Route.serversNotFound") },
        { status: 404 }
      );
    }

    for (const serverId of serverIds) {
      const serverName = serverNames.data.find(s => s.id === serverId)?.name ?? "desconocido";
      const log = await createEventLog({
        eventType: "USER_GRANTED_SERVER_ACCESS",
        userId: targetUserId,
        message: `EventLog.logMessage.user_granted_server_access|${userFullName}|${serverName}`,
        serverId,
      });

      if (!log || log.error) {
        return NextResponse.json(
          { success: false, data: null, error: t("Server.Route.eventLogError") },
          { status: 500 }
        );
      }
    }

    for (const serverDeleteAccess of result.data.removed) {
      const serverName = serverNames.data.find(s => s.id === serverDeleteAccess.id)?.name ?? "desconocido";

      const log = await createEventLog({
        eventType: "USER_REVOKED_SERVER_ACCESS",
        userId: targetUserId,
        message: `EventLog.logMessage.user_revoked_server_access|${userFullName}|${serverName}`,
        serverId: serverDeleteAccess.id,
      });

      if (!log || log.error) {
        return NextResponse.json(
          { success: false, data: null, error: t("Server.Route.eventLogError") },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: null,
        error: null,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in PUT /api/server/assignServers:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
