import { NextResponse } from "next/server";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerById, updateServerWithGpus } from "@/features/server/data";

export async function PUT(request: Request) {
  try {

    const isAdmin = await hasCategory("ADMIN");
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para cambiar la disponibilidad de servidores" },
        { status: 403 }
      );
    }

    const { serverId } = await request.json();

    if (!serverId) {
      return NextResponse.json({ error: "Id del servidor requerido" }, { status: 400 });
    }

    const server = await getServerById(serverId);

    if (!server.data) {
      return NextResponse.json({ error: "Servidor no encontrado" }, { status: 404 });
    }

    const updatedServer = await updateServerWithGpus({
      serverId: server.data.id,
      name: server.data.name,
      ramGB: server.data.ramGB,
      diskCount: server.data.diskCount,
      available: !server.data.available,
      gpus: server.data.gpus.map(gpu => ({
        id: gpu.id,
        type: gpu.type,
        name: gpu.name,
        ramGB: gpu.ramGB
      })),
    });

    return NextResponse.json({ updatedServer });
  } catch (error) {
    console.error("Error cambiando disponibilidad:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
