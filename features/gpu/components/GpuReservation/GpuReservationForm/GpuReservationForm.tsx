"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  GpuReservationFormProps,
  RawGpuReservationFormData,
} from "./GpuReservationForm.types";
import { gpuReservationFormSchema } from "@/features/gpu/schemas";
import {
  DateRangePicker,
  GpuSelector,
  TimePickerField,
} from "@/components/Shared";
import axios from "axios";
import { toast } from "sonner";
import { useDynamicTimeDefaults } from "./hooks/useDynamicTimeDefaults";
import { useAvailableGpus } from "../GpuReservationDialog/useGpuReservationDialog";
import { getDateWithTime, truncateToMinutes } from "@/features/gpu/utils";

export function GpuReservationForm({
  serverId,
  closeDialog,
  onSuccess,
}: GpuReservationFormProps) {
  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 30);

  const form = useForm<RawGpuReservationFormData>({
    resolver: zodResolver(gpuReservationFormSchema),
    defaultValues: {
      serverId,
      range: { from: today, to: today },
      startHour: "09:00",
      endHour: "18:00",
      selectedGpuIds: [],
    },
  });

  useDynamicTimeDefaults(form);
  const availableGpus = useAvailableGpus(true, serverId);

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
    const maxDurationMs = 1000 * 60 * 60 * 24 * 3;

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
      onSuccess();
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
            selectedHour={""}
          />
          <TimePickerField name="endHour" label="Hora fin" selectedHour={""} />
        </div>
        <GpuSelector name="selectedGpuIds" availableGpus={availableGpus.gpus} />
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
