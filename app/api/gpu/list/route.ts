import { getActiveOrFutureUserReservations } from "@/features/gpu/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { updateGpuReservationStatuses } from "@/lib/services/reservations/updateStatus";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await updateGpuReservationStatuses();

    const { userId } = await hasCategory();

    if (!userId) {
      return NextResponse.json(
        { success: false, data: null, error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    const reservationList = await getActiveOrFutureUserReservations(userId);

    return NextResponse.json(
      { success: true, data: reservationList, error: null },
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
