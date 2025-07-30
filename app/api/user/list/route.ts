import { NextResponse } from "next/server";
import { getAllUsers, getAssignedUsers, getUserById } from "@/features/user/data";
import { hasCategory } from "@/lib/auth/hasCategory";

export async function GET() {
  try {
    const { userId, isCategory } = await hasCategory(["ADMIN", "RESEARCHER"]);

    if (!userId) {
      return NextResponse.json(
        { success: false, data: null, error: "No autenticado" },
        { status: 401 }
      );
    }

    if (!isCategory) {
      return NextResponse.json(
        { success: false, data: null, error: "No tiene permisos" },
        { status: 403 }
      );
    }

    const user = await getUserById(userId);

    if (!user.success) {
      return NextResponse.json(
        { success: false, data: null, error: user.error || "Error al obtener usuario" },
        { status: 500 }
      );
    }

    if (!user.data) {
      return NextResponse.json(
        { success: false, data: null, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    if (user.data.category === "ADMIN") {
      const users = await getAllUsers();
      return NextResponse.json(
        { success: users.success, data: users.data, error: users.error },
        { status: users.success ? 200 : 500 }
      );
    } else if (user.data.category === "RESEARCHER") {
      const users = await getAssignedUsers(user.data.id);
      return NextResponse.json(
        { success: users.success, data: users.data, error: users.error },
        { status: users.success ? 200 : 500 }
      );
    } else {
      return NextResponse.json(
        { success: false, data: null, error: "Acceso prohibido" },
        { status: 403 }
      );
    }
  } catch (error) {
    console.error("Error en GET /api/user/list:", error);
    return NextResponse.json(
      { success: false, data: null, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
