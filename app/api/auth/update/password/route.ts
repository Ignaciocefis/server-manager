import { auth } from "@/auth";
import { db } from "@/lib/db";
import bcrypt, { compare } from "bcryptjs";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const { currentPassword, newPassword } = await req.json();

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId || !currentPassword || !newPassword) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const passwordMatch = await compare(currentPassword, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Contraseña actual incorrecta" }, { status: 401 });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({ success: true, message: "Contraseña actualizada correctamente" });

  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}