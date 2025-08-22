import { createEventLog } from "@/features/eventLog/data";
import { deleteUserById, getUserNameById } from "@/features/user/data";
import { getFullName } from "@/features/user/utils";
import { hasCategory } from "@/lib/auth/hasCategory";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { data: null, success: false, error: "ID de usuario no proporcionado o inválido" },
        { status: 400 }
      );
    }

    const { isCategory } = await hasCategory("ADMIN");
    if (!isCategory) {
      return NextResponse.json(
        { data: null, success: false, error: "No tienes permisos para eliminar usuarios" },
        { status: 403 }
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
    const deleted = await deleteUserById(userId);

    if (!deleted || deleted.error || !deleted.success) {
      return NextResponse.json(
        { data: null, success: false, error: "No se pudo eliminar el usuario" },
        { status: 500 }
      );
    }

    const log = await createEventLog({
      eventType: "USER_DELETED",
      userId: userId,
      message: `Usuario ${userFullName} eliminado`,
    });

    if (!log || log.error) {
      return NextResponse.json(
        { data: null, success: false, error: "Error al crear el registro de evento" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: null, success: true, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en DELETE /api/user/delete:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
