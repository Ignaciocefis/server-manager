import { getUserById } from "@/features/user/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await hasCategory();

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await getUserById(userId);

    if (!user) {
      return NextResponse.json(
        { data: null, success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { data: user, success: true, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al obtener información del usuario:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
