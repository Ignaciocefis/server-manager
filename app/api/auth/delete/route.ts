import { deleteUserById } from "@/features/user/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {

  const body = await request.json();

  const { userId } = body;

  try {
    const isAdmin = await hasCategory("ADMIN");
    if (!isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar usuarios" },
        { status: 403 }
      );
    }

    if (!userId) {
      return NextResponse.json({ error: "ID de usuario no proporcionado" }, { status: 400 });
    }
    
    const deleted = await deleteUserById(userId);
    if (deleted) {
      return NextResponse.json({ message: "Usuario eliminado" }, { status: 200 });
    } else {
      return NextResponse.json({ error: "No se pudo eliminar el usuario" }, { status: 500 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "No se pudo eliminar el usuario" }, { status: 500 });
  }
}