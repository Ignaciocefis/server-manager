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

  useEffect(() => {
    const subscription = form.watch((values) => {
      const { range, startHour, endHour, selectedGpuIds } = values;
      const { from, to } = range || {};

      if (!from || !to) {
        setAvailableGpus([]);
        return;
      }

      const startDateTime = from instanceof Date && typeof startHour === "string"
        ? getDateWithTime(from, startHour)
        : new Date();
      const endDateTime = to instanceof Date && typeof endHour === "string"
        ? getDateWithTime(to, endHour)
        : new Date();

      if (startDateTime >= endDateTime) {
        setAvailableGpus([]);
        return;
      }

      if (!Array.isArray(gpus)) {
        setAvailableGpus([]);
        return;
      }

      const filtered = gpus.filter((gpu) =>
        !gpu.reservations.some((r) => {
          const rStart = new Date(r.startDate);
          const rEnd = new Date(r.endDate);

          return hasOverlap(startDateTime, endDateTime, rStart, rEnd);
        })
      );

      setAvailableGpus(filtered);

      const filteredIds = selectedGpuIds
        ?.filter((id): id is string => typeof id === "string" && filtered.some((g) => g.id === id)) || [];
      const sameSelection =
        selectedGpuIds?.length === filteredIds.length &&
        selectedGpuIds?.every((id) => typeof id === "string" && filteredIds.includes(id));

      if (!sameSelection) {
        form.setValue("selectedGpuIds", filteredIds, { shouldValidate: true, shouldDirty: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [form, gpus]);

  return availableGpus;
}
