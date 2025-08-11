import { NextResponse } from "next/server";
import { hasCategory } from "@/lib/auth/hasCategory";
import { existsServerByName, createServer } from "@/features/server/data";
import { createServerFormSchema } from "@/features/server/shemas";
import { createEventLog } from "@/features/eventLog/data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = createServerFormSchema.parse(body);

    const isAdmin = await hasCategory("ADMIN");
    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "No tienes permisos para crear servidores",
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
          error: "Ya existe un servidor con ese nombre",
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
          error: "No se pudo crear el servidor",
        },
        { status: 500 }
      );
    }

    const log = await createEventLog({
      eventType: "SERVER_CREATED",
      message: `Se ha creado un nuevo servidor: ${data.name}`,
      serverId: serverCreated.data,
    });

    if (!log || log.error) {
      return NextResponse.json(
        { success: false, data: null, error: "Error al crear el registro de evento" },
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
    console.error("Error interno en POST /api/server/create:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
