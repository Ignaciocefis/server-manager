import { auth } from "@/auth";
import { getActiveOrFutureUserReservations } from "@/data/gpu";
import { updateGpuReservationStatuses } from "@/lib/services/reservations/updateStatus";
import { NextResponse } from "next/server";

export async function GET() {
  await updateGpuReservationStatuses();

  try {
    const session = await auth();
    const authUserId = session?.user?.id;

    if (!authUserId) {
      return NextResponse.json({ error: "El id es obligatorio" }, { status: 400 });
    }

    const reservationList = await getActiveOrFutureUserReservations(authUserId);

    return NextResponse.json(reservationList, { status: 200 });

  } catch (error) {
    console.error("Error fetching GPU:", error);
    return NextResponse.json({ error: "Error fetching GPU" }, { status: 500 });
  }
}
