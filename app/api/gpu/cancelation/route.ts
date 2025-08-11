import { NextResponse } from "next/server";
import { cancelGpuReservation, getGpuNameById, getReservationByIdAndUser } from "@/features/gpu/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { createEventLog } from "@/features/eventLog/data";
import { getServersNameById } from "@/features/server/data";

export async function PUT(req: Request) {
  try {
    const { userId } = await hasCategory();

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { success: false, data: null, error: "No se pudo obtener el ID del usuario" },
        { status: 401 }
      );
    }

    const { reservationId } = await req.json();

    if (!reservationId || typeof reservationId !== "string") {
      return NextResponse.json(
        { success: false, data: null, error: "El ID de la reserva es obligatorio" },
        { status: 400 }
      );
    }

    const reservation = await getReservationByIdAndUser(reservationId, userId);

    if (!reservation || !reservation.data) {
      return NextResponse.json(
        { success: false, data: null, error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    if (reservation.data.status === "CANCELLED") {
      return NextResponse.json(
        { success: false, data: null, error: "La reserva ya está cancelada" },
        { status: 409 }
      );
    }

    const canceled = await cancelGpuReservation(reservationId);

    if (!canceled || !canceled.success) {
      return NextResponse.json(
        { success: false, data: null, error: "Error al cancelar la reserva" },
        { status: 500 }
      );
    }

    const gpuName = await getGpuNameById(reservation.data.gpuId);

    if (!gpuName || !gpuName.success || !gpuName.data) {
      return NextResponse.json(
        { success: false, data: null, error: "GPU no encontrada" },
        { status: 404 }
      );
    }

    const serverName = await getServersNameById([reservation.data.serverId]);

    if (!serverName || !serverName.success || !serverName.data) {
      return NextResponse.json(
        { success: false, data: null, error: "Servidor no encontrado" },
        { status: 404 }
      );
    }

    const log = await createEventLog({
      eventType: "RESERVATION_CANCELLED",
      message: `La reserva de la gráfica ${gpuName.data.name} del servidor ${serverName.data[0].name} ha sido cancelada.`,
      reservationId: reservationId,
      userId: userId,
      serverId: reservation.data.serverId,
    });

    if (!log || log.error) {
      return NextResponse.json(
        { success: false, data: null, error: "Error al crear el registro de evento" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: null, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al cancelar la reserva:", error);
    return NextResponse.json(
      { success: false, data: null, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
