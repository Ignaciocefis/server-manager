import { NextResponse } from "next/server";
import { hasCategory } from "@/lib/auth/hasCategory";
import { changeServerAvailability, getServerByIdWithReservations, getAllUsersWithAccessToServer } from "@/features/server/data";
import { createEventLog } from "@/features/eventLog/data";
import { sendEmailAvailabilityChange } from "@/lib/services/resend/serverAvailabilityChange/serverAvailabilityChange";

export async function PUT(request: Request) {
  try {
    const { isCategory } = await hasCategory("ADMIN");

    if (!isCategory) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "No tienes permisos para cambiar la disponibilidad de servidores",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { serverId } = body;

    if (!serverId || typeof serverId !== "string") {
      return NextResponse.json(
        { success: false, data: null, error: "ID del servidor requerido" },
        { status: 400 }
      );
    }

    const updated = await changeServerAvailability(serverId);

    if (!updated.success || !updated.data) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: updated?.error || "No se pudo actualizar el servidor",
        },
        { status: 500 }
      );
    }

    const updatedServer = await getServerByIdWithReservations(serverId);

    if (!updatedServer || !updatedServer.data || !updatedServer.data.name) {
      return NextResponse.json(
        { success: false, data: null, error: "Servidor no encontrado" },
        { status: 404 }
      );
    }

    const log = await createEventLog({
      eventType: `${updated.data ? "SERVER_AVAILABLE" : "SERVER_UNAVAILABLE"}`,
      message: `El estado de disponibilidad del servidor ${updatedServer.data.name} ha sido cambiada a ${updated.data ? "disponible" : "no disponible"}.`,
      serverId: serverId,
    });

    if (!log || log.error) {
      return NextResponse.json(
        { success: false, data: null, error: "Error al crear el registro de evento" },
        { status: 500 }
      );
    }

    const usersWithAccess = await getAllUsersWithAccessToServer(serverId);

    if (!usersWithAccess || usersWithAccess.error || !usersWithAccess.data) {
      return NextResponse.json(
        { success: false, data: null, error: "Error al obtener usuarios con acceso al servidor" },
        { status: 500 }
      );
    }

    for (const user of usersWithAccess.data) {
      try {
        await sendEmailAvailabilityChange(
          user.email,
          user.gpus,
          updatedServer.data?.name ?? "Servidor",
          updatedServer.data?.available ? "disponible" : "no disponible"
        );
      } catch (error) {
        console.error("Error al enviar correo de cambio de disponibilidad:", error);
      }
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
    console.error("Error en PUT /api/server/availability:", error);
    return NextResponse.json(
      { success: false, data: null, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
