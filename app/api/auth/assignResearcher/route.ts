import { assignJuniorToResearcher, getUserById } from "@/data/user";
import { hasCategory } from "@/lib/auth/hasCategory";
import { assignResearcherFormSchema } from "@/lib/schemas/auth/assignResearcher.schema";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const body = await request.json();

  const data = assignResearcherFormSchema.parse(body);

  const { userId, researcherId } = data;

  try {
    const isAdmin = await hasCategory("ADMIN");
    if (!isAdmin) {
      return NextResponse.json(
        { error: "No tienes permisos para editar usuarios" },
        { status: 403 }
      );
    }

    const junior = await getUserById(userId);
    const researcher = await getUserById(researcherId);

    if (!junior || !researcher) {
      return NextResponse.json(
        { error: "Usuario o investigador no encontrado" },
        { status: 404 }
      );
    }

    const isAssigned = await assignJuniorToResearcher(userId, researcherId);

    if (!isAssigned) {
      return NextResponse.json({ error: "Error al asignar investigador" }, { status: 500 });
    }

    return NextResponse.json({ message: "Investigador asignado correctamente" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al asignar investigador" }, { status: 500 });
  }
}
