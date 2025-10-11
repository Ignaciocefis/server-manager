import { NextResponse } from "next/server";
import { hasCategory } from "@/lib/auth/hasCategory";
import { existsServerByName, createServer } from "@/features/server/data";
import { createServerFormSchema } from "@/features/server/shemas";
import { createEventLog } from "@/features/eventLog/data";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";

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
