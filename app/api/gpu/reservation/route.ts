import { auth } from "@/auth/auth";
import { createGpuReservations, getGpusByIdsAndServer, getOverlappingReservations } from "@/data/gpu";
import { hasAccessToServer } from "@/data/server";
import { hasCategory } from "@/lib/auth/hasCategory";
import { gpuReservationFormSchema } from "@/lib/schemas/gpu/reservation.schema";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Usuario requerido" }, { status: 400 });
  }
  
  const isAdmin = await hasCategory("ADMIN");

  try {
    const body = await req.json();
    const data = gpuReservationFormSchema.parse(body);

    if (data.startHour >= data.endHour) {
      return NextResponse.json({ error: "La hora de inicio debe ser anterior a la hora de fin." }, { status: 400 });
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

    const startDate = getDateTime(data.range.from, data.startHour);
    const endDate = getDateTime(data.range.to, data.endHour);

    if (startDate >= endDate) {
      return NextResponse.json({ error: "La fecha y hora de inicio deben ser anteriores a las de fin." }, { status: 400 });
    }

    const truncatedStart = truncateToMinutes(startDate);
    const truncatedEnd = truncateToMinutes(endDate);
    const now = new Date();
    const truncatedNow = truncateToMinutes(now);

    if (truncatedEnd <= truncatedNow || truncatedStart < truncatedNow) {
      return NextResponse.json({
        error: "No puedes crear reservas en el pasado.",
      }, { status: 400 });
    }

    if (!isAdmin) {
      const access = await hasAccessToServer(userId, data.serverId);
      if (!access) {
        return NextResponse.json({
          error: "No tienes acceso al servidor especificado.",
        }, { status: 403 });
      }
    }

    let gpus;
    try {
      gpus = await getGpusByIdsAndServer(data.selectedGpuIds, data.serverId);
    } catch (error) {
      return NextResponse.json({ error: "Error al obtener las GPUs.", details: error }, { status: 500 });
    }
    if (gpus.length !== data.selectedGpuIds.length) {
      return NextResponse.json({ error: "Algunas GPUs no existen o no pertenecen al servidor indicado." }, { status: 400 });
    }

    const hasOverlap = await getOverlappingReservations(data.selectedGpuIds, startDate, endDate);

    if (hasOverlap) {
      return NextResponse.json(
        { error: "Una o más GPUs ya están reservadas en ese rango de fechas." },
        { status: 409 }
      );
    }

    try {
      await createGpuReservations(data.selectedGpuIds, userId, data.serverId, startDate, endDate);
    } catch (error) {
      return NextResponse.json({ error: "Error al crear las reservas.", details: error }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Reserva error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
