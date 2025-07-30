import { existsServerByName, getServerById, updateServerWithGpus } from "@/features/server/data";
import { updateServerFormSchema } from "@/features/server/shemas";
import { hasCategory } from "@/lib/auth/hasCategory";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const { isCategory } = await hasCategory("ADMIN");

    if (!isCategory) {
      return NextResponse.json(
        { success: false, data: null, error: "No tienes permisos para editar servidores" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = updateServerFormSchema.parse(body);
    const { serverId, ...serverData } = data;

    if (!serverId || typeof serverId !== "string") {
      return NextResponse.json(
        { success: false, data: null, error: "ID de servidor inválido" },
        { status: 400 }
      );
    }

    const existingServer = await getServerById(serverId);
    if (!existingServer || !existingServer.data) {
      return NextResponse.json(
        { success: false, data: null, error: "Servidor no encontrado" },
        { status: 404 }
      );
    }

    if (existingServer.data.name !== serverData.name) {
      const nameExists = await existsServerByName(serverData.name);
      if (nameExists) {
        return NextResponse.json(
          { success: false, data: null, error: "Ya existe un servidor con ese nombre" },
          { status: 409 }
        );
      }
    }

    const updatedServer = await updateServerWithGpus(data);

    if (!updatedServer) {
      return NextResponse.json(
        { success: false, data: null, error: "Error actualizando el servidor" },
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
    console.error("Error actualizando servidor:", error);
    return NextResponse.json(
      { success: false, data: null, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
