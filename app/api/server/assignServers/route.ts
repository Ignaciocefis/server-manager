import { assignServersToUser } from "@/features/server/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const { userId: requesterId, isCategory } = await hasCategory(["ADMIN", "RESEARCHER"]);

    if (!requesterId || !isCategory) {
      return NextResponse.json(
        { success: false, data: null, error: "No autenticado o sin permisos" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId: targetUserId, serverIds } = body;

    if (!targetUserId || !Array.isArray(serverIds) || serverIds.some(id => typeof id !== "string")) {
      return NextResponse.json(
        { success: false, data: null, error: "Parámetros inválidos" },
        { status: 400 }
      );
    }

    const result = await assignServersToUser(targetUserId, serverIds);

    if (!result.success) {
      return NextResponse.json(
        { success: false, data: null, error: result.error || "No se pudo asignar los servidores" },
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
    console.error("Error en PUT /api/server/assignServers:", error);
    return NextResponse.json(
      { success: false, data: null, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
