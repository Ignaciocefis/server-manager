import { NextResponse } from "next/server";
import { getUserNameById } from "@/features/user/data";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";

export async function GET(request: Request) {
  try {
    const { t } = await getServerLanguage();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, data: null, error: t("User.Route.userNotFound") },
        { status: 400 }
      );
    }

    const result = await getUserNameById(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, data: null, error: result.error || t("User.Route.userNotFound") },
        { status: 500 }
      );
    }

    if (!result.data) {
      return NextResponse.json(
        { success: false, data: null, error: t("User.Route.userNotFound") },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.data, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/user/researcher/findResearcher:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
