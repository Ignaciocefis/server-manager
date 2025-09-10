import { getAccessibleReservationsByUser } from "@/features/gpu/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { updateGpuReservationStatuses } from "@/lib/services/reservations/updateStatus";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await updateGpuReservationStatuses();

    const { userId, isCategory } = await hasCategory("ADMIN");

    if (!userId) {
      return NextResponse.json(
        { success: false, data: null, error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    let reservationForCalendar;
    if (isCategory) {
      reservationForCalendar = await getAccessibleReservationsByUser("admin");
    } else {
      reservationForCalendar = await getAccessibleReservationsByUser(userId);

    }
    if (!reservationForCalendar.success) {
      return NextResponse.json(
        { success: false, data: null, error: reservationForCalendar.error || "Error al obtener las reservas" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: reservationForCalendar.data, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching GPU reservations:", error);
    return NextResponse.json(
      { success: false, data: null, error: "Error interno al obtener las reservas" },
      { status: 500 }
    );
  }
}
