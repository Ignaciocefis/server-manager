import { createEventLog } from "@/features/eventLog/data";
import { getUserNameById, toggleUserActiveStatus } from "@/features/user/data";
import { getFullName } from "@/features/user/utils";
import { hasCategory } from "@/lib/auth/hasCategory";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const { isCategory } = await hasCategory("ADMIN");

    if (!isCategory) {
      return NextResponse.json(
        { success: false, data: null, error: "No tienes permisos para modificar usuarios" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { success: false, data: null, error: "ID de usuario no proporcionado o inválido" },
        { status: 400 }
      );
    }

    const result = await toggleUserActiveStatus(userId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, data: null, error: "No se pudo actualizar el estado del usuario" },
        { status: 500 }
      );
    }

    const userName = await getUserNameById(userId);

    if (userName.error || !userName.success || !userName.data) {
      return NextResponse.json(
        { data: null, success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const userFullName = getFullName(
      userName.data.firstSurname ?? undefined,
      userName.data.secondSurname ?? undefined,
      userName.data.name ?? undefined
    );

    const log = await createEventLog({
      eventType: `${result.data ? "USER_REACTIVATED" : "USER_DEACTIVATED"}`,
      userId,
      message: `Usuario ${userFullName} ${result.data ? "activado" : "desactivado"}`,
    });

    if (!log || log.error) {
      return NextResponse.json(
        { success: false, data: null, error: "Error al crear el registro de evento" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en PATCH /api/user/researcher/toggleActive:", error);
    return NextResponse.json(
      { success: false, data: null, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
