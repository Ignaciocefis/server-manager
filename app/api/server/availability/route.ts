import { NextResponse } from "next/server";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerById, updateServerWithGpus } from "@/data/server";

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

    if (!server) {
      return NextResponse.json({ error: "Servidor no encontrado" }, { status: 404 });
    }

    const updatedServer = await updateServerWithGpus({
      serverId: server.id,
      name: server.name,
      ramGB: server.ramGB,
      diskCount: server.diskCount,
      available: !server.available,
      gpus: server.gpus.map(gpu => ({
        id: gpu.id,
        type: gpu.type,
        name: gpu.name,
        ramGB: gpu.ramGB,
        status: gpu.status,
        userId: gpu.userId ?? undefined,
      })),
    });

    return NextResponse.json({ updatedServer });
  } catch (error) {
    console.error("Error cambiando disponibilidad:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
