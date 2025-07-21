import { NextResponse } from "next/server";
import { cancelGpuReservation, getReservationByIdAndUser } from "@/features/gpu/data";
import { hasCategory } from "@/lib/auth/hasCategory";

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

    await cancelGpuReservation(reservationId);

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
