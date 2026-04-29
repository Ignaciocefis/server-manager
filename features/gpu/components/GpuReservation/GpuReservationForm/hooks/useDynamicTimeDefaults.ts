import { useEffect, useRef } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { RawGpuReservationFormData } from "../GpuReservationForm.types";
import { pad } from "@/features/gpu/utils";

export function useDynamicTimeDefaults(form: UseFormReturn<RawGpuReservationFormData>) {
  const range = useWatch({ control: form.control, name: "range" });
  const endHour = useWatch({ control: form.control, name: "endHour" });
  const lastFromKey = useRef<string | null>(null);

  useEffect(() => {
    const { from, to } = range ?? {};
    if (!(from instanceof Date) || !(to instanceof Date)) return;

    const now = new Date();
    const nowTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const isValidTime = (value: unknown): value is string =>
      typeof value === "string" && /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);

    const isFromToday = from.toDateString() === now.toDateString();
    const shouldFixEnd = !isValidTime(endHour);
    const fromKey = from.toDateString();
    const didDateChange = lastFromKey.current !== fromKey;

    if (didDateChange) {
      form.setValue("startHour", isFromToday ? nowTime : "00:00", {
        shouldValidate: true,
        shouldDirty: true,
      });
      lastFromKey.current = fromKey;
    }

    if (shouldFixEnd) {
      form.setValue("endHour", "23:59", {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [range, endHour, form]);
}
