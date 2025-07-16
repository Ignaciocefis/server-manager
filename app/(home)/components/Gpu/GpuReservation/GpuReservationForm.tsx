"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Gpu,
  GpuReservationFormProps,
  RawGpuReservationFormData,
} from "./GpuReservation.types";
import { gpuReservationFormSchema } from "@/lib/schemas/gpu/reservation.schema";
import {
  DateRangePicker,
  GpuSelector,
  TimePickerField,
} from "@/components/Shared/FormItems";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export function GpuReservationForm({
  serverId,
  gpus,
  closeDialog,
}: GpuReservationFormProps) {
  const today = useMemo(() => new Date(), []);
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 30);

  const pad = (n: number) => n.toString().padStart(2, "0");
  const nowTime = `${pad(today.getHours())}:${pad(today.getMinutes())}`;

  const defaultStartHour = nowTime;
  const defaultEndHour = "23:59";

  const form = useForm<RawGpuReservationFormData>({
    resolver: zodResolver(gpuReservationFormSchema),
    defaultValues: {
      serverId: serverId,
      range: { from: new Date(), to: new Date() },
      startHour: "09:00",
      endHour: "18:00",
      selectedGpuIds: [],
    },
  });

  const watchRange = form.watch("range");
  const watchStartHour = form.watch("startHour");
  const watchEndHour = form.watch("endHour");

  const [availableGpus, setAvailableGpus] = useState<Gpu[]>([]);

  const getDateWithTime = (date: Date, time: string): Date => {
    const [h, m] = time.split(":").map(Number);
    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    return d;
  };

  const truncateToMinutes = (date: Date): Date => {
    const d = new Date(date);
    d.setSeconds(0, 0);
    return d;
  };

  const hasOverlap = (
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date
  ): boolean => start1 < end2 && end1 > start2;

  useEffect(() => {
    const { from, to } = watchRange;
    if (!from || !to) return;

    const isFromToday =
      from instanceof Date && from.toDateString() === new Date().toDateString();

    form.setValue("startHour", isFromToday ? nowTime : "00:00", {
      shouldValidate: true,
    });
    form.setValue("endHour", "23:59", { shouldValidate: true });
  }, [watchRange, nowTime, form]);

  useEffect(() => {
    const { from, to } = watchRange;
    if (!from || !to) return;

    const startDateTime =
      from instanceof Date ? getDateWithTime(from, watchStartHour) : new Date();
    const endDateTime =
      to instanceof Date ? getDateWithTime(to, watchEndHour) : new Date();

    if (startDateTime >= endDateTime) {
      setAvailableGpus([]);
      return;
    }

    const filtered = gpus.filter(
      (gpu) =>
        !gpu.reservations.some((r) => {
          const rStart = new Date(r.startTime);
          const rEnd = new Date(r.endTime);
          return hasOverlap(startDateTime, endDateTime, rStart, rEnd);
        })
    );

    setAvailableGpus(filtered);

    form.setValue(
      "selectedGpuIds",
      form
        .getValues("selectedGpuIds")
        .filter((id) => filtered.some((g) => g.id === id))
    );
  }, [watchRange, watchStartHour, watchEndHour, gpus, form]);

  const onSubmit = async (data: RawGpuReservationFormData) => {
    const from = new Date(data.range.from as string | number | Date);
    const to = new Date(data.range.to as string | number | Date);
    const start = getDateWithTime(from, data.startHour);
    const end = getDateWithTime(to, data.endHour);
    const now = new Date();

    if (from > to) {
      form.setError("range", {
        message: "La fecha de inicio no puede ser posterior a la de fin",
      });
      return;
    }

    const truncatedStart = truncateToMinutes(start);
    const truncatedNow = truncateToMinutes(now);

    if (
      truncatedStart < truncatedNow ||
      truncateToMinutes(end) <= truncatedNow
    ) {
      toast.error("No puedes crear reservas en el pasado");
      return;
    }

    if (
      from.toDateString() === to.toDateString() &&
      data.startHour >= data.endHour
    ) {
      form.setError("endHour", {
        message:
          "La hora de fin debe ser posterior a la de inicio si es el mismo día",
      });
      return;
    }

    if (
      from.toDateString() === now.toDateString() &&
      truncateToMinutes(start) < truncateToMinutes(now)
    ) {
      form.setError("startHour", {
        message: "La hora de inicio no puede estar en el pasado",
      });
      return;
    }

    const diffMs = end.getTime() - start.getTime();
    const maxDurationMs = 1000 * 60 * 60 * 24 * 3; // 3 días
    if (diffMs > maxDurationMs) {
      toast.error("La duración máxima de una reserva es de 3 días");
      return;
    }

    if (data.selectedGpuIds.length === 0) {
      form.setError("selectedGpuIds", {
        type: "manual",
        message: "Debes seleccionar al menos una GPU",
      });
      return;
    }

    try {
      await axios.post("/api/gpu/reservation", {
        ...data,
        range: { from, to },
      });

      toast.success("Reserva creada correctamente");

      closeDialog();
    } catch (error) {
      console.error("Error al crear la reserva:", error);
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      toast.error(errorMessage || "Error al crear la reserva");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-lg mx-auto p-4 space-y-6 flex flex-col"
      >
        <DateRangePicker name="range" minDate={today} maxDate={maxDate} />

        <div className="flex gap-4">
          <TimePickerField
            name="startHour"
            label="Hora inicio"
            selectedHour={defaultStartHour}
          />
          <TimePickerField
            name="endHour"
            label="Hora fin"
            selectedHour={defaultEndHour}
          />
        </div>

        <GpuSelector name="selectedGpuIds" availableGpus={availableGpus} />

        <div className="flex gap-4 justify-center">
          <Button
            type="submit"
            className="bg-green-app-500 hover:bg-green-app-500-transparent w-40 max-w-xs"
          >
            Reservar
          </Button>
          <Button
            type="button"
            onClick={closeDialog}
            className="bg-red-app-500 hover:bg-red-app-500-transparent w-40 max-w-xs"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
