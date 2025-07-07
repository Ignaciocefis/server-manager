import { NextResponse } from "next/server";
import { getAllUsers, getAssignedUsers } from "@/data/user";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (session.user?.category === "JUNIOR") {
    return NextResponse.json({ error: "No tiene permisos" }, { status: 403 });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  if (user.category === "ADMIN") {
    const users = await getAllUsers();
    return NextResponse.json(users);
  } else if (user.category === "RESEARCHER") {
    const users = await getAssignedUsers(user.id);
    return NextResponse.json(users);
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
