import { getAllResearchers } from "@/features/user/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { isCategory } = await hasCategory("ADMIN");
    if (!isCategory) {
      return NextResponse.json(
        { success: false, data: null, error: "No tienes permisos para ver usuarios" },
        { status: 403 }
      );
    }

    const result = await getAllResearchers();

    if (!result.success) {
      return NextResponse.json(
        { success: false, data: null, error: result.error || "Error al obtener investigadores" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.data, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en GET /api/user/researcher/allResearchers:", error);
    return NextResponse.json(
      { success: false, data: null, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
