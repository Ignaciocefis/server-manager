import { getAccessibleReservationsByUser } from "@/features/gpu/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { updateGpuReservationStatuses } from "@/lib/services/reservations/updateStatus";
import { NextResponse } from "next/server";

/**
 * @openapi
 * {
 *   "description": "Returns GPU reservations formatted for calendar visualization. Admin users get global data; other users get their accessible data.",
 *   "responses": {
 *     "401": {
 *       "description": "Unauthorized"
 *     }
 *   }
 * }
 */
export async function GET() {
  try {
    const { t } = await getServerLanguage();

    await updateGpuReservationStatuses();

    const { userId, isCategory } = await hasCategory("ADMIN");

    if (!userId) {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.unauthorized") },
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
        { success: false, data: null, error: reservationForCalendar.error || t("Gpu.Route.fetchReservationsError") },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: reservationForCalendar.data, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/gpu/calendar:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
