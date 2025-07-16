import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date();

  try {
    const activate = await db.gpuReservation.updateMany({
      where: {
        status: "PENDING",
        startTime: { lte: now },
        endTime: { gte: now },
      },
      data: {
        status: "ACTIVE",
      },
    });

    const complete = await db.gpuReservation.updateMany({
      where: {
        status: { in: ["ACTIVE", "EXTENDED"] },
        endTime: { lt: now },
      },
      data: {
        status: "COMPLETED",
      },
    });

    return NextResponse.json({
      message: "Estados de reserva actualizados",
      activated: activate.count,
      completed: complete.count,
    });
  } catch (error) {
    console.error("Error actualizando estados de reserva:", error);
    return NextResponse.json(
      { error: "Error actualizando estados de reserva" },
      { status: 500 }
    );
  }
}
