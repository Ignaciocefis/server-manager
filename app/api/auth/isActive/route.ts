import { NextResponse } from "next/server";
import { userIsActive } from "@/features/user/data";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";

export async function GET(req: Request) {
  try {
    const { t } = await getServerLanguage();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { data: null, success: false, error: t("Auth.Route.invalidEmail") },
        { status: 400 }
      );
    }

    const result = await userIsActive(email);

    if (!result?.success || result.data == null) {
      return NextResponse.json(
        { data: { exists: false }, success: false, error: t("Auth.Route.userNotFound") },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: {
          exists: true,
          isActive: result.data ?? false,
        },
        success: true,
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/auth/isActive:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}