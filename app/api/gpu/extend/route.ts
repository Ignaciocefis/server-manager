import { NextResponse } from "next/server";
import {
  extendGpuReservation,
  getGpuNameById,
  getOverlappingReservations,
  getReservationByIdAndUser,
} from "@/features/gpu/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { createEventLog } from "@/features/eventLog/data";
import { getServersNameById } from "@/features/server/data";

export async function PUT(req: Request) {
  try {
    const { userId } = await hasCategory();

    if (!userId) {
      return NextResponse.json(
        { success: false, data: null, error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { extendedUntil, reservationId } = body;

    if (!reservationId || typeof reservationId !== "string") {
      return NextResponse.json(
        { success: false, data: null, error: "ID de reserva requerido" },
        { status: 400 }
      );
    }

    if (!extendedUntil || isNaN(Date.parse(extendedUntil))) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "La fecha de extensión es obligatoria y debe ser válida",
        },
        { status: 400 }
      );
    }

    const extendedUntilDate = new Date(extendedUntil);

    const reservationResponse = await getReservationByIdAndUser(reservationId, userId);

    if (!reservationResponse.success) {
      return NextResponse.json(
        { success: false, data: null, error: "Error verificando la reserva" },
        { status: 500 }
      );
    }

    const reservation = reservationResponse.data ?? null;

    if (!reservation) {
      return NextResponse.json(
        { success: false, data: null, error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    if (["CANCELLED", "COMPLETED", "EXTENDED"].includes(reservation.status)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error:
            "No se puede extender una reserva prorrogada, finalizada o cancelada",
        },
        { status: 400 }
      );
    }

    const currentEnd = reservation.extendedUntil ?? reservation.endDate;

    if (!currentEnd || extendedUntilDate <= currentEnd) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "La nueva fecha de finalización debe ser posterior a la actual",
        },
        { status: 400 }
      );
    }

    const hasOverlap = await getOverlappingReservations(
      [reservation.gpuId],
      currentEnd,
      extendedUntilDate
    );

    if (!hasOverlap.success || hasOverlap.data) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "La prórroga se superpone con otra reserva existente",
        },
        { status: 400 }
      );
    }

    const updated = await extendGpuReservation(reservationId, extendedUntilDate);

    if (!updated || !updated.success) {
      return NextResponse.json(
        { success: false, data: null, error: "Error al extender la reserva" },
        { status: 500 }
      );
    }

    const gpuName = await getGpuNameById(reservation.gpuId);

    if (!gpuName || !gpuName.success || !gpuName.data) {
      return NextResponse.json(
        { success: false, data: null, error: "GPU no encontrada" },
        { status: 404 }
      );
    }

    const serverName = await getServersNameById([reservation.serverId]);

    if (!serverName || !serverName.success || !serverName.data) {
      return NextResponse.json(
        { success: false, data: null, error: "Servidor no encontrado" },
        { status: 404 }
      );
    }

    const log = await createEventLog({
      eventType: "RESERVATION_EXTENDED",
      message: `La reserva de la gráfica ${gpuName.data.name} del servidor ${serverName.data[0].name} ha sido extendida hasta ${extendedUntilDate.toISOString()}.`,
      reservationId: reservationId,
      userId: userId,
      serverId: reservation.serverId,
    });

    if (!log || log.error) {
      return NextResponse.json(
        { success: false, data: null, error: "Error al crear el registro de evento" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: updated, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al extender reserva:", error);
    return NextResponse.json(
      { success: false, data: null, error: "Error interno al extender la reserva" },
      { status: 500 }
    );
  }
}
