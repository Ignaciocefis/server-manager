
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { cancelGpuReservation } from "@/data/gpu";

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

    console.log("Canceling reservation:", reservationId);

    if (!reservationId) {
      return NextResponse.json(
        { error: "El ID de la reserva es obligatorio" },
        { status: 400 }
      );
    }

    const reservation = await db.gpuReservation.findUnique({
      where: { id: reservationId, userId },
    });

    console.log("Found reservation:", reservation);

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
