import { NextResponse } from "next/server";
import {
  extendGpuReservation,
  getOverlappingReservations,
  getReservationByIdAndUser,
} from "@/features/gpu/data";
import { hasCategory } from "@/lib/auth/hasCategory";

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

    const reservation = reservationResponse.data;

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

    // Validar solapamientos con otras reservas
    const hasOverlap = await getOverlappingReservations(
      [reservation.gpuId],
      currentEnd,
      extendedUntilDate
    );

    if (hasOverlap) {
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
