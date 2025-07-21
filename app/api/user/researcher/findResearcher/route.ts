import { NextResponse } from "next/server";
import { getUserNameById } from "@/features/user/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, data: null, error: "El id es obligatorio" },
        { status: 400 }
      );
    }

    const result = await getUserNameById(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, data: null, error: result.error || "Error al consultar el usuario" },
        { status: 500 }
      );
    }

    if (!result.data) {
      return NextResponse.json(
        { success: false, data: null, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.data, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en GET /api/user/researcher/findResearcher:", error);
    return NextResponse.json(
      { success: false, data: null, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
