import { getActiveOrFutureUserReservations } from "@/features/gpu/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { updateGpuReservationStatuses } from "@/lib/services/reservations/updateStatus";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { t } = await getServerLanguage();

    await updateGpuReservationStatuses();

    const { userId } = await hasCategory();

    if (!userId) {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.unauthorized") },
        { status: 401 }
      );
    }

    const reservationList = await getActiveOrFutureUserReservations(userId);

    return NextResponse.json(
      { success: true, data: reservationList, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/gpu/list:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
