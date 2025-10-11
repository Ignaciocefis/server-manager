import { getAllResearchers } from "@/features/user/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { t } = await getServerLanguage();

    const { isCategory } = await hasCategory("ADMIN");

    if (!isCategory) {
      return NextResponse.json(
        { success: false, data: null, error: t("User.Route.unauthorized") },
        { status: 403 }
      );
    }

    const result = await getAllResearchers();

    if (!result.success) {
      return NextResponse.json(
        { success: false, data: null, error: result.error || t("User.Route.getResearchersError") },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.data, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/user/researcher/allResearchers:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
