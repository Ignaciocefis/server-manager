import { NextResponse } from "next/server";
import { hasCategory } from "@/lib/auth/hasCategory";
import { changeServerAvailability } from "@/features/server/data";

export async function PUT(request: Request) {
  try {
    const { isCategory } = await hasCategory("ADMIN");

    if (!isCategory) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "No tienes permisos para cambiar la disponibilidad de servidores",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { serverId } = body;

    if (!serverId || typeof serverId !== "string") {
      return NextResponse.json(
        { success: false, data: null, error: "ID del servidor requerido" },
        { status: 400 }
      );
    }

    const updated = await changeServerAvailability(serverId);

    if (!updated?.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: updated?.error || "No se pudo actualizar el servidor",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: null,
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en PUT /api/server/availability:", error);
    return NextResponse.json(
      { success: false, data: null, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
