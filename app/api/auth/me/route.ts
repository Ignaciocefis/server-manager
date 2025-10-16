import { getUserById } from "@/features/user/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await hasCategory();

    const { t } = await getServerLanguage();

    if (!userId) {
      return NextResponse.json(
        { data: null, success: false, error: t("Auth.Route.unauthorized") },
        { status: 401 }
      );
    }

    const result = await getUserById(userId);

    if (!result?.success || result.data == null) {
      return NextResponse.json(
        { data: { exists: false }, success: false, error: t("Auth.Route.userNotFound") },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: {
          ...result.data,
        },
        success: true,
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/auth/me:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );

  }
}
