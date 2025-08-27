import { getAllUnreadNotifications } from "@/features/eventLog/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await hasCategory();

    if (!userId) {
      return NextResponse.json(
        { success: false, data: null, error: "No estás autenticado" },
        { status: 401 }
      );
    }

    const notifications = await getAllUnreadNotifications(userId);

    if (!notifications.success) {
      console.error("Error al obtener notificaciones:", notifications.error);
      return NextResponse.json(
        { success: false, data: null, error: "Error al obtener notificaciones" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: notifications.data, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    return NextResponse.json(
      { success: false, data: null, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
