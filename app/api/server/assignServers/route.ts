import { addServerAccessForUser, removeAllServerAccessForUser } from "@/data/server";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const { userId, serverIds } = await request.json();

    if (!userId || !Array.isArray(serverIds)) {
      return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 });
    }

    await removeAllServerAccessForUser(userId);

    const newLinks = serverIds.map((serverId: string) => ({
      userId,
      serverId,
    }));

    await addServerAccessForUser(newLinks);

    return NextResponse.json({ message: "Servidores asignados correctamente" });
  } catch (error) {
    console.error("Error al asignar servidores:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}