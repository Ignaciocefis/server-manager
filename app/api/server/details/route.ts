import {
  getServerByIdWithReservations,
  hasAccessToServer,
} from "@/features/server/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { updateGpuReservationStatuses } from "@/lib/services/reservations/updateStatus";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    await updateGpuReservationStatuses();

    const { searchParams } = new URL(request.url);
    const serverId = searchParams.get("serverId");

    if (!serverId || typeof serverId !== "string") {
      return NextResponse.json(
        { success: false, data: null, error: "ID del servidor requerido" },
        { status: 400 }
      );
    }

    const { userId } = await hasCategory();

    if (!userId) {
      return NextResponse.json(
        { success: false, data: null, error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    const server = await getServerByIdWithReservations(serverId);
    if (!server) {
      return NextResponse.json(
        { success: false, data: null, error: "Servidor no encontrado" },
        { status: 404 }
      );
    }

    const canAccess = await hasAccessToServer(userId, serverId);
    if (!canAccess) {
      return NextResponse.json(
        { success: false, data: null, error: "Acceso denegado" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: true, data: server, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en la API:", error);
    return NextResponse.json(
      { success: false, data: null, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
