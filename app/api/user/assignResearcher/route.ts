import { createEventLog } from "@/features/eventLog/data";
import { assignJuniorToResearcher, getUserNameById, userExistsById } from "@/features/user/data";
import { assignResearcherFormSchema } from "@/features/user/schemas";
import { getFullName } from "@/features/user/utils";
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

    const userName = await getUserNameById(userId);
    const researcherName = await getUserNameById(researcherId);

    if (userName.error || !userName.success || !userName.data || !researcherName.success || researcherName.error || !researcherName.data) {
      return NextResponse.json(
        { data: null, success: false, error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const userFullName = getFullName(
      userName.data.firstSurname ?? undefined,
      userName.data.secondSurname ?? undefined,
      userName.data.name ?? undefined
    );
    const researcherFullName = getFullName(
      researcherName.data.firstSurname ?? undefined,
      researcherName.data.secondSurname ?? undefined,
      researcherName.data.name ?? undefined
    );

    if (!userName || !researcherName || userName.error || researcherName.error) {
      return NextResponse.json(
        { data: null, success: false, error: "Error al obtener nombres de usuario" },
        { status: 500 }
      );
    }

    const log = await createEventLog({
      eventType: "USER_ASSIGNED_MENTOR",
      userId,
      message: `Usuario ${userFullName} asignado al investigador ${researcherFullName}`,
    });

    if (!log || log.error) {
      return NextResponse.json(
        { data: null, success: false, error: "Error al crear el registro de evento" },
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
