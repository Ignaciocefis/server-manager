import { NextResponse } from "next/server";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerById, updateServer, existsServerByName } from "@/data/server";
import { updateServerFormSchema } from "@/lib/schemas/server/update.schema";

export async function PUT(request: Request) {
  try {
    const isAdmin = await hasCategory("ADMIN");

    if (!isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para editar servidores" },
        { status: 403 }
      );
    }
    const body = await request.json();

    const data = updateServerFormSchema.parse(body);

    const { serverId, name, ramGB, diskCount, available } = data;

    const existingServer = await getServerById(serverId);
    if (!existingServer) {
      return NextResponse.json(
        { error: "Servidor no encontrado" },
        { status: 404 }
      );
    }

    if (existingServer.name !== name) {
      const nameExists = await existsServerByName(name);
      if (nameExists) {
        return NextResponse.json(
          { error: "Ya existe un servidor con ese nombre" },
          { status: 409 }
        );
      }
    }

    const updatedServerResult = await updateServer(serverId, {
      serverId,
      name,
      ramGB,
      diskCount,
      available,
    });

    return NextResponse.json(
      { message: "Servidor actualizado correctamente", server: updatedServerResult },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error actualizando servidor:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}