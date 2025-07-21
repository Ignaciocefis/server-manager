import { toggleUserActiveStatus } from "@/features/user/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {

  const body = await request.json();

  const { userId } = body;

  try {
    const isAdmin = await hasCategory("ADMIN");
    if (!isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para modificar usuarios" },
        { status: 403 }
      );
    }

    if (!userId) {
      return NextResponse.json({ error: "ID de usuario no proporcionado" }, { status: 400 });
    }

    const updated = await toggleUserActiveStatus(userId);

    if (updated) {
      return NextResponse.json({ message: "Estado de usuario actualizado" }, { status: 200 });
    } else {
      return NextResponse.json({ error: "No se pudo actualizar el estado del usuario" }, { status: 500 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "No se pudo actualizar el estado del usuario" }, { status: 500 });
  }
}
