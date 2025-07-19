
import { NextResponse } from "next/server";
import { auth } from "@/auth/auth";
import { cancelGpuReservation, getReservationByIdAndUser } from "@/data/gpu";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "No se pudo obtener el ID del usuario" },
        { status: 401 }
      );
    }

    const { reservationId } = await req.json();

    if (!reservationId) {
      return NextResponse.json(
        { error: "El ID de la reserva es obligatorio" },
        { status: 400 }
      );
    }

    const reservation = await getReservationByIdAndUser(reservationId, userId);

    if (!reservation) {
      return NextResponse.json(
        { error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    if (reservation.status === "CANCELLED") {
      return NextResponse.json(
        { error: "La reserva ya está cancelada" },
        { status: 409 }
      );
    }

    await cancelGpuReservation(reservationId);

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al cancelar la reserva:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
