import { useEffect, useState } from "react";
import { RawGpuReservationFormData } from "../GpuReservationForm.types";
import { UseFormReturn, useWatch } from "react-hook-form";
import { Gpu } from "@/features/gpu/types";
import { getDateWithTime, hasOverlap } from "@/features/gpu/utils";

export function useAvailableGpus(
  gpus: Gpu[],
  form: UseFormReturn<RawGpuReservationFormData>
) {
  const [availableGpus, setAvailableGpus] = useState<Gpu[]>([]);
  const range = useWatch({ control: form.control, name: "range" });
  const startHour = useWatch({ control: form.control, name: "startHour" });
  const endHour = useWatch({ control: form.control, name: "endHour" });
  const selectedGpuIds = useWatch({
    control: form.control,
    name: "selectedGpuIds",
  });
  const isValidTime = (value: unknown): value is string =>
    typeof value === "string" && /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);

  useEffect(() => {
    const { from, to } = range || {};

    if (!(from instanceof Date) || !(to instanceof Date)) {
      setAvailableGpus([]);
      return;
    }

    if (!isValidTime(startHour) || !isValidTime(endHour)) {
      setAvailableGpus([]);
      return;
    }

    const startDateTime = getDateWithTime(from, startHour);
    const endDateTime = getDateWithTime(to, endHour);

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
        const rEnd = r.extendedUntil ? new Date(r.extendedUntil) : new Date(r.endDate);

        return hasOverlap(startDateTime, endDateTime, rStart, rEnd);
      })
    );

    setAvailableGpus(filtered);

    const filteredIds =
      selectedGpuIds?.filter(
        (id): id is string =>
          typeof id === "string" && filtered.some((g) => g.id === id)
      ) || [];
    const sameSelection =
      selectedGpuIds?.length === filteredIds.length &&
      selectedGpuIds?.every(
        (id) => typeof id === "string" && filteredIds.includes(id)
      );

    if (!sameSelection) {
      form.setValue("selectedGpuIds", filteredIds, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [range, startHour, endHour, selectedGpuIds, form, gpus]);

  return availableGpus;
}
