import { getUserAccessibleServers } from "@/features/server/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;
    const idParam = searchParams.get("id");

    let { userId } = await hasCategory();

    if (!userId) {
      return NextResponse.json(
        { success: false, data: null, error: "El ID de usuario es obligatorio" },
        { status: 400 }
      );
    }

    if (idParam) userId = idParam;

    const serverList = await getUserAccessibleServers(userId);

    if (!serverList.success) {
      return NextResponse.json(
        { success: false, data: null, error: serverList.error || "Error al obtener los servidores" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: serverList.data, error: null },
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
