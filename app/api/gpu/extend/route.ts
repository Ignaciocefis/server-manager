import { auth } from "@/auth/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"
import { getOverlappingReservations } from "../../../../features/gpu/data"

export async function PUT(
  req: Request) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ error: "Usuario no autenticado" }, { status: 401 })
    }

    const body = await req.json()
    const { extendedUntil, reservationId } = body

    if (!reservationId) {
      return NextResponse.json({ error: "ID de reserva requerido" }, { status: 400 })
    }

    if (!extendedUntil) {
      return NextResponse.json(
        { error: "La fecha de extensión es obligatoria" },
        { status: 400 }
      )
    }

    const extendedUntilDate = new Date(extendedUntil)

    const reservation = await db.gpuReservation.findUnique({
      where: { id: reservationId },
    })

    if (!reservation) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 })
    }

    if (reservation.userId !== userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    if (
      reservation.status === "CANCELLED" ||
      reservation.status === "COMPLETED"
    ) {
      return NextResponse.json(
        { error: "No se puede extender una reserva finalizada o cancelada" },
        { status: 400 }
      )
    }

    const currentEnd = reservation.extendedUntil ?? reservation.endDate

    if (!currentEnd || extendedUntilDate <= currentEnd) {
      return NextResponse.json(
        { error: "La nueva hora de finalización debe ser posterior a la actual" },
        { status: 400 }
      )
    }

    const hasOverlap = await getOverlappingReservations([reservation.gpuId], currentEnd, extendedUntilDate);

    if (hasOverlap) {
      return NextResponse.json(
        { error: "La prórroga se superpone con otra reserva existente" },
        { status: 400 }
      )
    }

    const updated = await db.gpuReservation.update({
      where: { id: reservationId },
      data: {
        extendedAt: new Date(),
        extendedUntil: extendedUntilDate,
        status: "EXTENDED",
      },
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error("Error al extender reserva:", error)
    return NextResponse.json(
      { error: "Error interno al extender la reserva" },
      { status: 500 }
    )
  }
}