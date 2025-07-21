import { deleteServer, existsServerById } from "@/features/server/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  const { serverId } = await req.json();

  try {
    const isAdmin = await hasCategory("ADMIN");
    if (!isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar servidores" },
        { status: 403 }
      );
    }

    if (!serverId) {
      return NextResponse.json({ error: "ID del servidor requerido" }, { status: 400 });
    }

    const serverExists = await existsServerById(serverId);
    if (!serverExists) {
      return NextResponse.json(
        { error: "No existe un servidor con ese ID" },
        { status: 404 }
      );
    }

    const deleted = await deleteServer(serverId);
  
    return NextResponse.json({ message: "Servidor eliminado correctamente", deleted });
  } catch (error) {
    console.error("Error eliminando servidor:", error);
    return NextResponse.json({ error: "Error eliminando servidor" }, { status: 500 });
  }
}

