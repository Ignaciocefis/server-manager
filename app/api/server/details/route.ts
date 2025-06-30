import { getServerById, hasAccessToServer } from "@/data/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("serverId");
    const userId = searchParams.get("userId");

    if (!id || !userId) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const server = await getServerById(id);
    if (!server) {
      return NextResponse.json({ error: "Servidor no encontrado" }, { status: 404 });
    }

    const canAccess = await hasAccessToServer(userId, id);
    if (!canAccess) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    return NextResponse.json(server);
  } catch (error) {
    console.error("Error en la API:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}