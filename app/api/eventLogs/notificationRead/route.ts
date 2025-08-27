import { markNotificationAsRead } from "@/features/eventLog/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const { userId } = await hasCategory();

    if (!userId) {
      return NextResponse.json(
        { success: false, data: null, error: "Usuario no autorizado" },
        { status: 401 }
      );
    }

    const { id } = await request.json();

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { success: false, data: null, error: "Faltan datos de la notificación" },
        { status: 400 }
      );
    }

    const markNotificationsAsRead = await markNotificationAsRead(id, userId);

    if (!markNotificationsAsRead || !markNotificationsAsRead.success) {
      return NextResponse.json(
        { success: false, data: null, error: "Error al marcar notificación como leída" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: null, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al marcar notificación como leída:", error);
    return NextResponse.json(
      { success: false, data: null, error: "Error al marcar notificación como leída" },
      { status: 500 }
    );
  }
}