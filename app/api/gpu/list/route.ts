import { auth } from "@/auth";
import { getActiveOrFutureUserReservations } from "@/data/gpu";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    const authUserId = session?.user?.id;

    if (!authUserId) {
      return NextResponse.json({ error: "El id es obligatorio" }, { status: 400 });
    }

    const reservationList = await getActiveOrFutureUserReservations(authUserId);

    return NextResponse.json(reservationList, { status: 200 });

  } catch (error) {
    console.error("Error fetching GPU list:", error);
    return NextResponse.json({ error: "Error fetching GPU list" }, { status: 500 });
  }
}
