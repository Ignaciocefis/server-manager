import { useEffect, useState } from "react";
import { RawGpuReservationFormData } from "../GpuReservationForm.types";
import { UseFormReturn } from "react-hook-form";
import { Gpu } from "@/features/gpu/types";
import { getDateWithTime, hasOverlap } from "@/features/gpu/utils";

export function useAvailableGpus(
  gpus: Gpu[],
  form: UseFormReturn<RawGpuReservationFormData>
) {
  const [availableGpus, setAvailableGpus] = useState<Gpu[]>([]);
  const watchRange = form.watch("range");
  const watchStartHour = form.watch("startHour");
  const watchEndHour = form.watch("endHour");

  useEffect(() => {
    const { from, to } = watchRange;
    if (!from || !to) return;

    const startDateTime = from instanceof Date ? getDateWithTime(from, watchStartHour) : new Date();
    const endDateTime = to instanceof Date ? getDateWithTime(to, watchEndHour) : new Date();

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

  return availableGpus;
}
