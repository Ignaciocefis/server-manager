import { assignJuniorToResearcher, userExistsById } from "@/features/user/data";
import { assignResearcherFormSchema } from "@/features/user/schemas";
import { hasCategory } from "@/lib/auth/hasCategory";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const data = assignResearcherFormSchema.parse(body);
    const { userId, researcherId } = data;

    const { isCategory } = await hasCategory("ADMIN");
    if (!isCategory) {
      return NextResponse.json(
        { data: null, success: false, error: "No tienes permisos para editar usuarios" },
        { status: 403 }
      );
    }

    const junior = await userExistsById(userId);
    const researcher = await userExistsById(researcherId);

    if (!junior || !researcher) {
      return NextResponse.json(
        { data: null, success: false, error: "Usuario o investigador no encontrado" },
        { status: 404 }
      );
    }

    const isAssigned = await assignJuniorToResearcher(userId, researcherId);

    if (!isAssigned || isAssigned.error || !isAssigned.success) {
      return NextResponse.json(
        { data: null, success: false, error: "Error al asignar investigador" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { data: "Investigador asignado correctamente", success: true, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en PUT /api/user/assignResearcher:", error);
    return NextResponse.json(
      { data: null, success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
