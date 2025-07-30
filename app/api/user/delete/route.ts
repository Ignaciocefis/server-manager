import { deleteUserById } from "@/features/user/data";
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

    const deleted = await deleteUserById(userId);

    if (!deleted || deleted.error || !deleted.success) {
      return NextResponse.json(
        { data: null, success: false, error: "No se pudo eliminar el usuario" },
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
