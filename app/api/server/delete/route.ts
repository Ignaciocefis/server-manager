import { createEventLog } from "@/features/eventLog/data";
import { deleteServer, existsServerById, getServersNameById } from "@/features/server/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

/**
 * @openapi
 * {
 *   "description": "Deletes a server by id.",
 *   "requestBody": {
 *     "required": true,
 *     "content": {
 *       "application/json": {
 *         "schema": {
 *           "type": "object",
 *           "required": ["serverId"],
 *           "properties": {
 *             "serverId": {
 *               "type": "string"
 *             }
 *           }
 *         }
 *       }
 *     }
 *   },
 *   "responses": {
 *     "400": {
 *       "description": "Missing or invalid serverId"
 *     },
 *     "403": {
 *       "description": "Unauthorized"
 *     },
 *     "404": {
 *       "description": "Server not found"
 *     }
 *   }
 * }
 */
export async function DELETE(req: Request) {
  try {
    const { t } = await getServerLanguage();

    const { serverId } = await req.json();

    const isAdmin = await hasCategory("ADMIN");
    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: t("Server.Route.unauthorized"),
        },
        { status: 403 }
      );
    }

    if (!serverId || typeof serverId !== "string") {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: t("Server.Route.serverIdRequired"),
        },
        { status: 400 }
      );
    }

    const serverExists = await existsServerById(serverId);
    if (!serverExists) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: t("Server.Route.serverNotFound"),
        },
        { status: 404 }
      );
    }

    const serverName = await getServersNameById([serverId]);

    if (!serverName || serverName.error || !serverName.success || !serverName.data) {
      return NextResponse.json(
        { success: false, data: null, error: t("Server.Route.getServerNameError") },
        { status: 500 }
      );
    }

    const log = await createEventLog({
      eventType: "SERVER_DELETED",
      message: `EventLog.logMessage.server_deleted|${serverName.data[0].name}`,
      serverId: serverId,
    });

    if (!log || log.error) {
      return NextResponse.json(
        { success: false, data: null, error: t("Server.Route.eventLogError") },
        { status: 500 }
      );
    }

    const deleted = await deleteServer(serverId);

    if (!deleted || !deleted.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: deleted?.error || t("Server.Route.deleteServerError"),
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: deleted.data,
        error: null,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in DELETE /api/server/delete:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
