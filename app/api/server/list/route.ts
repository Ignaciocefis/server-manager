import { getUserAccessibleServers } from "@/features/server/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

/**
 * @openapi
 * {
 *   "description": "Returns servers accessible by the current user. Optional id query can be used to inspect another user's server list.",
 *   "parameters": [
 *     {
 *       "name": "id",
 *       "in": "query",
 *       "required": false,
 *       "schema": {
 *         "type": "string"
 *       }
 *     }
 *   ],
 *   "responses": {
 *     "400": {
 *       "description": "Missing user context"
 *     }
 *   }
 * }
 */
export async function GET(req: Request) {
  try {
    const { t } = await getServerLanguage();

    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const idParam = searchParams.get("id");

    let { userId } = await hasCategory();

    if (!userId) {
      return NextResponse.json(
        { success: false, data: null, error: t("Gpu.Route.unauthorized") },
        { status: 401 }
      );
    }

    if (idParam) userId = idParam;

    const serverList = await getUserAccessibleServers(userId);

    if (!serverList.success) {
      if (serverList.error === "User not found") {
        return NextResponse.json(
          { success: false, data: null, error: t("Gpu.Route.unauthorized") },
          { status: 401 }
        );
      }
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
