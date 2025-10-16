import { NextResponse } from "next/server";
import { getAssignedUsers, getUserById } from "@/features/user/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";

export async function GET(request: Request) {
  try {
    const { userId, isCategory } = await hasCategory(["ADMIN", "RESEARCHER"]);

    const { t } = await getServerLanguage();

    if (!userId) {
      return NextResponse.json(
        { success: false, data: null, error: t("User.Route.unauthorized") },
        { status: 401 }
      );
    }

    if (!isCategory) {
      return NextResponse.json(
        { success: false, data: null, error: t("User.Route.unauthorized") },
        { status: 403 }
      );
    }

    const url = new URL(request.url)
    const page = Number(url.searchParams.get("page") ?? 1)
    const limit = Number(url.searchParams.get("limit") ?? 20)
    const sortField = url.searchParams.get("sortField") ?? "createdAt"
    const sortOrder = (url.searchParams.get("sortOrder") as "asc" | "desc") ?? "desc"
    const filterTitle = url.searchParams.get("filterTitle") ?? ""

    const user = await getUserById(userId);

    if (!user.success || !user.data) {
      return NextResponse.json(
        { success: false, data: null, error: user.error || t("User.Route.userNotFound") },
        { status: 500 }
      );
    }

    let usersResult;
    if (user.data.category === "ADMIN") {
      usersResult = await getAssignedUsers("all", {
        page,
        limit,
        sortField,
        sortOrder,
        filterTitle,
      });
    } else if (user.data.category === "RESEARCHER") {
      usersResult = await getAssignedUsers(user.data.id, {
        page,
        limit,
        sortField,
        sortOrder,
        filterTitle,
      });
    }

    if (usersResult) {
      return NextResponse.json(
        { success: usersResult.success, data: usersResult.data, error: usersResult.error },
        { status: usersResult.success ? 200 : 500 }
      );
    } else {
      return NextResponse.json(
        { success: false, data: null, error: t("User.Route.unauthorized") },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error("Error in GET /api/user/list:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
