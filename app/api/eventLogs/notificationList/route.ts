import { getAllUnreadNotifications } from "@/features/eventLog/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { t } = await getServerLanguage();

    const { userId } = await hasCategory();

    if (!userId) {
      return NextResponse.json(
        { success: false, data: null, error: t("EventLogs.Route.unauthorized") },
        { status: 401 }
      );
    }

    const notifications = await getAllUnreadNotifications(userId);

    if (!notifications.success) {
      console.error("Error al obtener notificaciones:", notifications.error);
      return NextResponse.json(
        { success: false, data: null, error: t("EventLogs.Route.fetchNotificationsError") },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: notifications.data, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/eventLogs/notificationList:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
