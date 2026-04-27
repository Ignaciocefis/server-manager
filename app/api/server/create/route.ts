import { NextResponse } from "next/server";
import { hasCategory } from "@/lib/auth/hasCategory";
import { existsServerByName, createServer } from "@/features/server/data";
import { createServerFormSchema } from "@/features/server/shemas";
import { createEventLog } from "@/features/eventLog/data";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";

/**
 * @openapi
 * {
 *   "description": "Creates a new server and its related GPU configuration.",
 *   "requestBody": {
 *     "required": true,
 *     "content": {
 *       "application/json": {
 *         "schema": {
 *           "type": "object",
 *           "required": ["name"],
 *           "properties": {
 *             "name": {
 *               "type": "string"
 *             },
 *             "ramGB": {
 *               "type": "number"
 *             },
 *             "diskCount": {
 *               "type": "number"
 *             }
 *           }
 *         }
 *       }
 *     }
 *   },
 *   "responses": {
 *     "201": {
 *       "description": "Server created successfully"
 *     },
 *     "403": {
 *       "description": "Unauthorized"
 *     },
 *     "409": {
 *       "description": "Server already exists"
 *     }
 *   }
 * }
 */
export async function POST(request: Request) {
  try {
    const { t } = await getServerLanguage();

    const body = await request.json();
    const data = createServerFormSchema(t).parse(body);

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

    const serverExists = await existsServerByName(data.name);
    if (serverExists.success && serverExists.data) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: t("Server.Route.serverExists"),
        },
        { status: 409 }
      );
    }

    const serverCreated = await createServer(data);

    if (!serverCreated || !serverCreated.success || !serverCreated.data) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: t("Server.Route.createServerError"),
        },
        { status: 500 }
      );
    }

    const log = await createEventLog({
      eventType: "SERVER_CREATED",
      message: `EventLog.logMessage.server_created|${data.name}`,
      serverId: serverCreated.data,
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
        data: { serverId: serverCreated.data },
        error: null,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error in CREATE /api/server/create:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
