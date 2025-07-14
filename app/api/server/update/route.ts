import { existsServerByName, getServerById, updateServerWithGpus } from "@/data/server";
import { hasCategory } from "@/lib/auth/hasCategory";
import { updateServerFormSchema } from "@/lib/schemas/server/update.schema";
import { NextResponse } from "next/server";

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
    const { serverId, ...serverData } = data;

    console.log("Datos del servidor a actualizar:", data);

    const existingServer = await getServerById(serverId);
    if (!existingServer) {
      return NextResponse.json(
        { error: "Servidor no encontrado" },
        { status: 404 }
      );
    }

    if (existingServer.name !== serverData.name) {
      const nameExists = await existsServerByName(serverData.name);
      if (nameExists) {
        return NextResponse.json(
          { error: "Ya existe un servidor con ese nombre" },
          { status: 409 }
        );
      }
    }

    const updatedServer = await updateServerWithGpus(data);

    if (!updatedServer) {
      return NextResponse.json(
        { error: "Error actualizando el servidor" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Servidor actualizado correctamente",
        server: updatedServer,
      },
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