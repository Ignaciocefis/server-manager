import { createEventLog } from "@/features/eventLog/data";
import { deleteServer, existsServerById, getServersNameById } from "@/features/server/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  try {
    const { serverId } = await req.json();

    const isAdmin = await hasCategory("ADMIN");
    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "No tienes permisos para eliminar servidores",
        },
        { status: 403 }
      );
    }

    if (!serverId || typeof serverId !== "string") {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "ID del servidor requerido",
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
          error: "No existe un servidor con ese ID",
        },
        { status: 404 }
      );
    }

    const serverName = await getServersNameById([serverId]);

    if (!serverName || serverName.error || !serverName.success || !serverName.data) {
      return NextResponse.json(
        { success: false, data: null, error: "Error al obtener el nombre del servidor" },
        { status: 500 }
      );
    }

    const deleted = await deleteServer(serverId);

    if (!deleted || !deleted.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: deleted?.error || "No se pudo eliminar el servidor",
        },
        { status: 500 }
      );
    }

    const log = await createEventLog({
      eventType: "SERVER_DELETED",
      message: `El servidor ${serverName.data[0].name} ha sido eliminado.`,
      serverId: serverId,
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
        data: deleted.data,
        error: null,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error eliminando servidor:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Error eliminando servidor",
      },
      { status: 500 }
    );
  }
}
