import { auth } from "@/auth";
import { getServerById, hasAccessToServer } from "@/data/server";
import { updateGpuReservationStatuses } from "@/lib/services/reservations/updateStatus";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  await updateGpuReservationStatuses();
    
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("serverId");

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Usuario requerido" }, { status: 400 });
    }


    const server = await getServerById(id);
    if (!server) {
      return NextResponse.json({ error: "Servidor no encontrado" }, { status: 404 });
    }

    const canAccess = await hasAccessToServer(userId, id);
    if (!canAccess) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    return NextResponse.json(server);
  } catch (error) {
    console.error("Error en la API:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}