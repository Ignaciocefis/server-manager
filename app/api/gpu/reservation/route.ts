import { createEventLog } from "@/features/eventLog/data";
import {
  createGpuReservations,
  existGpusByIdsAndServer,
  getGpuNameById,
  getOverlappingReservations,
} from "@/features/gpu/data";
import { gpuReservationFormSchema } from "@/features/gpu/schemas";
import { getServersNameById, hasAccessToServer } from "@/features/server/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {
  const { userId, isCategory } = await hasCategory("ADMIN");
  if (!userId) {
    return NextResponse.json(
      { success: false, data: null, error: "Usuario no autenticado" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const data = gpuReservationFormSchema.parse(body);

    if (data.startHour >= data.endHour) {
      return NextResponse.json(
        { success: false, data: null, error: "La hora de inicio debe ser anterior a la hora de fin." },
        { status: 400 }
      );
    }

    const getDateTime = (date: Date, time: string) => {
      const [h, m] = time.split(":").map(Number);
      const dt = new Date(date);
      dt.setHours(h, m, 0, 0);
      return dt;
    };

    const truncateToMinutes = (date: Date) => {
      const d = new Date(date);
      d.setSeconds(0, 0);
      return d;
    };

    const startDate = truncateToMinutes(getDateTime(data.range.from, data.startHour));
    const endDate = truncateToMinutes(getDateTime(data.range.to, data.endHour));
    const now = truncateToMinutes(new Date());

    if (startDate >= endDate) {
      return NextResponse.json(
        { success: false, data: null, error: "La fecha y hora de inicio deben ser anteriores a las de fin." },
        { status: 400 }
      );
    }

    if (endDate <= now || startDate < now) {
      return NextResponse.json(
        { success: false, data: null, error: "No puedes crear reservas en el pasado." },
        { status: 400 }
      );
    }

    if (!isCategory) {
      const access = await hasAccessToServer(userId, data.serverId);
      if (!access) {
        return NextResponse.json(
          { success: false, data: null, error: "No tienes acceso al servidor especificado." },
          { status: 403 }
        );
      }
    }

    const gpuCheck = await existGpusByIdsAndServer(data.selectedGpuIds, data.serverId);
    if (!gpuCheck.success) {
      return NextResponse.json(
        { success: false, data: null, error: "Error al verificar GPUs", details: gpuCheck.error },
        { status: 500 }
      );
    }
    if (!gpuCheck.data) {
      return NextResponse.json(
        { success: false, data: null, error: "Algunas GPUs no existen o no pertenecen al servidor indicado." },
        { status: 400 }
      );
    }

    const overlapCheck = await getOverlappingReservations(data.selectedGpuIds, startDate, endDate);
    if (!overlapCheck.success) {
      return NextResponse.json(
        { success: false, data: null, error: "Error al comprobar solapamientos", details: overlapCheck.error },
        { status: 500 }
      );
    }
    if (overlapCheck.data) {
      return NextResponse.json(
        { success: false, data: null, error: "Una o más GPUs ya están reservadas en ese rango de fechas." },
        { status: 409 }
      );
    }

    const creation = await createGpuReservations(data.selectedGpuIds, userId, data.serverId, startDate, endDate);
    if (!creation.success) {
      return NextResponse.json(
        { success: false, data: null, error: "Error al crear la reserva", details: creation.error },
        { status: 500 }
      );
    }

    if (!creation.data || !creation.success) {
      return NextResponse.json(
        { success: false, data: null, error: "No se pudo crear la reserva" },
        { status: 500 }
      );
    }

    for (const reservation of creation.data) {
      const gpuName = await getGpuNameById(reservation.gpuId);

      if (!gpuName || !gpuName.success || !gpuName.data) {
        return NextResponse.json(
          { success: false, data: null, error: "GPU no encontrada" },
          { status: 404 }
        );
      }

      const serverName = await getServersNameById([reservation.serverId]);

      if (!serverName || !serverName.success || !serverName.data) {
        return NextResponse.json(
          { success: false, data: null, error: "Servidor no encontrado" },
          { status: 404 }
        );
      }

      const log = await createEventLog({
        eventType: "RESERVATION_CREATED",
        message: `Reserva creada para la gráfica ${gpuName.data.name} en el servidor ${serverName.data[0].name} desde ${startDate.toISOString()} hasta ${endDate.toISOString()}.`,
        reservationId: reservation.id,
        userId: userId,
        serverId: reservation.serverId,
      });

      if (!log || log.error) {
        return NextResponse.json(
          { success: false, data: null, error: "Error al crear el registro de evento" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { success: true, data: null, error: null },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, data: null, error: error.errors },
        { status: 400 }
      );
    }

    console.error("Reserva error:", error);
    return NextResponse.json(
      { success: false, data: null, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
