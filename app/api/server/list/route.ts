import { getUserAccessibleServers } from "@/features/server/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { NextResponse } from "next/server";

export async function GET() {
  try {

    const { userId } = await hasCategory();

    if (!userId) {
      return NextResponse.json(
        { success: false, data: null, error: "El ID de usuario es obligatorio" },
        { status: 400 }
      );
    }

    const serverList = await getUserAccessibleServers(userId);

    return NextResponse.json(
      { success: true, data: serverList, error: null },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error al obtener los servidores accesibles:", error);
    return NextResponse.json(
      { success: false, data: null, error: "Error interno al obtener los servidores" },
      { status: 500 }
    );
  }
}
