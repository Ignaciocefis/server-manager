import { markNotificationAsRead } from "@/features/eventLog/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

/**
 * @openapi
 * {
 *   "description": "Marks a single notification as read for the authenticated user.",
 *   "requestBody": {
 *     "required": true,
 *     "content": {
 *       "application/json": {
 *         "schema": {
 *           "type": "object",
 *           "required": ["id"],
 *           "properties": {
 *             "id": {
 *               "type": "string"
 *             }
 *           }
 *         }
 *       }
 *     }
 *   },
 *   "responses": {
 *     "400": {
 *       "description": "Invalid request payload"
 *     },
 *     "401": {
 *       "description": "Unauthorized"
 *     }
 *   }
 * }
 */
export async function PATCH(request: Request) {
  try {
    const { t } = await getServerLanguage();

    const { userId } = await hasCategory();

    if (!userId) {
      return NextResponse.json(
        { success: false, data: null, error: t("EventLog.Route.unauthorized") },
        { status: 401 }
      );
    }

    const { id } = await request.json();

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, data: null, error: t("EventLog.Route.missingNotificationData") },
        { status: 400 }
      );
    }

    const markNotificationsAsRead = await markNotificationAsRead(id, userId);

    if (!markNotificationsAsRead || !markNotificationsAsRead.success) {
      return NextResponse.json(
        { success: false, data: null, error: t("EventLog.Route.markNotificationError") },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: null, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PATCH /api/eventLogs/notificationRead:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}