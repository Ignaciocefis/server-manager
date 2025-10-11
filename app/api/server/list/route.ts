import { getUserAccessibleServers } from "@/features/server/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { t } = await getServerLanguage();

    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const idParam = searchParams.get("id");

    let { userId } = await hasCategory();

    if (!userId) {
      return NextResponse.json(
        { success: false, data: null, error: t("Server.Route.userIdRequired") },
        { status: 400 }
      );
    }

    if (idParam) userId = idParam;

    const serverList = await getUserAccessibleServers(userId);

    if (!serverList.success) {
      return NextResponse.json(
        { success: false, data: null, error: serverList.error || t("Server.Route.getServerListError") },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: serverList.data, error: null },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in GET /api/server/list:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
