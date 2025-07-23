import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { RawGpuReservationFormData } from "../GpuReservationForm.types";
import { pad } from "@/features/gpu/utils";

export function useDynamicTimeDefaults(form: UseFormReturn<RawGpuReservationFormData>) {
  const today = new Date();
  const nowTime = `${pad(today.getHours())}:${pad(today.getMinutes())}`;
  const watchRange = form.watch("range");

  useEffect(() => {
    const { from, to } = watchRange;
    if (!from || !to) return;

    const isFromToday = from instanceof Date && from.toDateString() === today.toDateString();

    form.setValue("startHour", isFromToday ? nowTime : "00:00", {
      shouldValidate: true,
    });
    form.setValue("endHour", "23:59", { shouldValidate: true });
  }, [watchRange, nowTime, form]);
}
