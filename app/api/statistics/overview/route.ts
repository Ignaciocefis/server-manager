import { getStatisticsOverview } from "@/features/statistics/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

const parseDateInput = (value?: string | null) => {
  if (!value) return undefined;

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export async function GET(request: Request) {
  try {
    const { t } = await getServerLanguage();
    const { userId, isCategory: isAdmin } = await hasCategory(["ADMIN"]);

    if (!userId) {
      return NextResponse.json(
        { success: false, data: null, error: t("Auth.Route.unauthorized") },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const selectedStartDate = parseDateInput(searchParams.get("startDate"));
    const selectedEndDate = parseDateInput(searchParams.get("endDate"));

    const normalizedStartDate =
      selectedStartDate &&
        selectedEndDate &&
        selectedStartDate > selectedEndDate
        ? selectedEndDate
        : selectedStartDate;
    const normalizedEndDate =
      selectedStartDate &&
        selectedEndDate &&
        selectedStartDate > selectedEndDate
        ? selectedStartDate
        : selectedEndDate;

    const overview = await getStatisticsOverview(userId, isAdmin, {
      startDate: normalizedStartDate,
      endDate: normalizedEndDate,
    });

    return NextResponse.json(
      { success: true, data: overview, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/statistics/overview:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}