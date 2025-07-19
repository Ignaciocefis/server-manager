import { auth } from "@/auth/auth";
import { assignServersToUser } from "@/data/server";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const { userId, serverIds } = await request.json();

  try {
    const session = await auth();
    const authUserId = session?.user?.id;

    if (!authUserId) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    if (!userId || !Array.isArray(serverIds)) {
      return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
    }

    const success = await assignServersToUser(userId, serverIds);

    if (!success) {
      return NextResponse.json({ error: "No se pudo asignar los servidores" }, { status: 500 });
    }

    return NextResponse.json({ message: "Servidores asignados correctamente" });
  } catch (error) {
    console.error("Error en la ruta assignServers:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
