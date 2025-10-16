import { getGpuUsageByYear } from "@/features/gpu/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { updateGpuReservationStatuses } from "@/lib/services/reservations/updateStatus";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");
    const year = Number(searchParams.get("year"));

    if (!serverId || !year) {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.missingParameters") },
        { status: 400 }
      );
    }

    const usage = await getGpuUsageByYear(serverId, year);

    if (!usage.success) {
      return NextResponse.json(
        { success: false, data: null, error: usage.error || t("Gpu.Route.errorFetchingUsage") },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: usage.data, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/gpu/heatmap:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}