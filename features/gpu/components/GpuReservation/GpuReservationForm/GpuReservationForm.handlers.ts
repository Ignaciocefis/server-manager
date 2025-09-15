import { RawGpuReservationFormData, SubmitHandlerOptionsProps } from "./GpuReservationForm.types";
import { UseFormReturn } from "react-hook-form";
import { getDateWithTime, truncateToMinutes } from "@/features/gpu/utils";
import { toast } from "sonner";
import axios from "axios";
import { handleApiError } from "@/lib/services/errors/errors";

export async function GpuReservationFormHandler(
  data: RawGpuReservationFormData,
  form: UseFormReturn<RawGpuReservationFormData>,
  { onSuccess, closeDialog }: SubmitHandlerOptionsProps
) {
  const from = new Date(data.range.from as string | number | Date);
  const to = new Date(data.range.to as string | number | Date);
  const start = getDateWithTime(from, data.startHour);
  const end = getDateWithTime(to, data.endHour);
  const now = new Date();

  const truncatedStart = truncateToMinutes(start);
  const truncatedNow = truncateToMinutes(now);

  if (from > to) {
    form.setError("range", {
      message: "La fecha de inicio no puede ser posterior a la de fin",
    });
    return;
  }

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
      message: "La hora de fin debe ser posterior a la de inicio si es el mismo día",
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

  await axios.post("/api/gpu/reservation", {
    ...data,
    range: { from, to },
  }).then(() => {
    toast.success("Reserva creada correctamente");
    closeDialog();
    onSuccess();
  }).catch((error) => {
    handleApiError(error, true);
  });
}
