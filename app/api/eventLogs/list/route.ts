import { NextResponse } from "next/server";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getAccessibleLogs, getAllLogs } from "@/features/eventLog/data";
import { updateGpuReservationStatuses } from "@/lib/services/reservations/updateStatus";

export async function GET(request: Request) {
  try {
    updateGpuReservationStatuses();

    const { userId, isCategory } = await hasCategory("ADMIN");

    if (!userId) {
      return NextResponse.json(
        { success: false, data: null, error: "No autenticado" },
        { status: 401 }
      );
    }

    const url = new URL(request.url)
    const page = Number(url.searchParams.get("page") ?? 1)
    const limit = Number(url.searchParams.get("limit") ?? 20)
    const sortField = url.searchParams.get("sortField") ?? "createdAt"
    const sortOrder = (url.searchParams.get("sortOrder") as "asc" | "desc") ?? "desc"
    const filterTitle = url.searchParams.get("filterTitle") ?? ""
    const typeFilter = url.searchParams.get("type") ?? "all";
    const serverId = url.searchParams.get("serverId") ?? undefined;

    let logsResult;
    if (isCategory) {
      logsResult = await getAllLogs({ page, limit, sortField, sortOrder, filterTitle, typeFilter }, serverId);
    } else {
      logsResult = await getAccessibleLogs(userId, serverId, { page, limit, sortField, sortOrder, filterTitle, typeFilter });
    }


    if (!logsResult || logsResult.error || logsResult.data === null) {
      return NextResponse.json(
        { success: false, data: null, error: logsResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          page: page,
          limit: limit,
          total: logsResult.data.total ?? 0,
          totalPages: logsResult.data.totalPages ?? 0,
          hasNext: logsResult.data.hasNext ?? false,
          hasPrev: logsResult.data.hasPrev ?? false,
          rows: logsResult.data.rows,
        },
        error: null,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error en GET /api/logs/list:", error);
    return NextResponse.json(
      { success: false, data: null, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
