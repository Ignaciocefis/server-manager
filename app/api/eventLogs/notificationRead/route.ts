import { markNotificationAsRead } from "@/features/eventLog/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const { t } = await getServerLanguage();

    const { userId } = await hasCategory();

    if (!userId) {
      return NextResponse.json(
        { success: false, data: null, error: t("EventLogs.Route.unauthorized") },
        { status: 401 }
      );
    }

    const { id } = await request.json();

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, data: null, error: t("EventLogs.Route.missingNotificationData") },
        { status: 400 }
      );
    }

    const markNotificationsAsRead = await markNotificationAsRead(id, userId);

    if (!markNotificationsAsRead || !markNotificationsAsRead.success) {
      return NextResponse.json(
        { success: false, data: null, error: t("EventLogs.Route.markNotificationError") },
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