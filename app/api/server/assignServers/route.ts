import { createEventLog } from "@/features/eventLog/data";
import { assignServersToUser, getServersNameById } from "@/features/server/data";
import { getUserNameById } from "@/features/user/data";
import { getFullName } from "@/features/user/utils";
import { hasCategory } from "@/lib/auth/hasCategory";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const { userId: requesterId, isCategory } = await hasCategory(["ADMIN", "RESEARCHER"]);

    if (!requesterId || !isCategory) {
      return NextResponse.json(
        { success: false, data: null, error: "No autenticado o sin permisos" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId: targetUserId, serverIds } = body;

    if (!targetUserId || !Array.isArray(serverIds) || serverIds.some(id => typeof id !== "string")) {
      return NextResponse.json(
        { success: false, data: null, error: "Parámetros inválidos" },
        { status: 400 }
      );
    }

    const result = await assignServersToUser(targetUserId, serverIds);

    if (!result.success || !result.data?.removed || result.error) {
      return NextResponse.json(
        { success: false, data: null, error: result.error || "No se pudo asignar los servidores" },
        { status: 500 }
      );
    }

    const userName = await getUserNameById(targetUserId);

    if (userName.error || !userName.success || !userName.data) {
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

    const serverNames = await getServersNameById(serverIds);

    if (serverNames.error || !serverNames.success || !serverNames.data) {
      return NextResponse.json(
        { data: null, success: false, error: "Servidores no encontrados" },
        { status: 404 }
      );
    }

    for (const serverId of serverIds) {
      const serverName = serverNames.data.find(s => s.id === serverId)?.name ?? "desconocido";
      const log = await createEventLog({
        eventType: "USER_GRANTED_SERVER_ACCESS",
        userId: targetUserId,
        message: `Usuario ${userFullName} tiene acceso al servidor: ${serverName}`,
        serverId,
      });

      if (!log || log.error) {
        return NextResponse.json(
          { success: false, data: null, error: "Error al crear el registro de evento" },
          { status: 500 }
        );
      }
    }

    for (const serverDeleteAccess of result.data.removed) {
      const serverName = serverNames.data.find(s => s.id === serverDeleteAccess.id)?.name ?? "desconocido";

      const log = await createEventLog({
        eventType: "USER_REVOKED_SERVER_ACCESS",
        userId: targetUserId,
        message: `Usuario ${userFullName} ha perdido acceso al servidor: ${serverName}`,
        serverId: serverDeleteAccess.id,
      });

      if (!log || log.error) {
        return NextResponse.json(
          { success: false, data: null, error: "Error al crear el registro de evento" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: null,
        error: null,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error en PUT /api/server/assignServers:", error);
    return NextResponse.json(
      { success: false, data: null, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
