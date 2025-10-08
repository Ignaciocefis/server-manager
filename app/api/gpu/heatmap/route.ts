import { getGpuUsageByYear } from "@/features/gpu/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { updateGpuReservationStatuses } from "@/lib/services/reservations/updateStatus";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {

    await updateGpuReservationStatuses();

    const { userId } = await hasCategory();

    if (!userId) {
      return NextResponse.json(
        { success: false, data: null, error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const serverId = searchParams.get("serverId");
    const year = Number(searchParams.get("year"));

    if (!serverId || !year) {
      return NextResponse.json(
        { success: false, data: null, error: "Faltan parámetros: serverId o year" },
        { status: 400 }
      );
    }

    const usage = await getGpuUsageByYear(serverId, year);

    if (!usage.success) {
      return NextResponse.json(
        { success: false, data: null, error: usage.error || "Error al obtener el uso de las GPU" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: usage.data, error: null },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching GPU reservations:", error);
    return NextResponse.json(
      { success: false, data: null, error: "Error interno al obtener las reservas" },
      { status: 500 }
    );
  }
}