"use client";

import { useState } from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  GpuReservationFormProps,
  RawGpuReservationFormData,
} from "./GpuReservationForm.types";
import {
  ConfirmDialog,
  DateRangePicker,
  GpuSelector,
  TimePickerField,
} from "@/components/Shared";
import { useDynamicTimeDefaults } from "./hooks/useDynamicTimeDefaults";
import { useAvailableGpus } from "./hooks/useAvailableGpus";
import { GpuReservationFormHandler } from "./GpuReservationForm.handlers";
import { useGpuReservationForm } from "./hooks/useGpuReservationForm";
import { format } from "date-fns";
import { useLanguage } from "@/hooks/useLanguage";

export function GpuReservationForm({
  serverId,
  gpus,
  closeDialog,
  onSuccess,
}: GpuReservationFormProps) {
  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 30);

  const { t } = useLanguage();

  const { form } = useGpuReservationForm(serverId);
  useDynamicTimeDefaults(form);

  const availableGpus = useAvailableGpus(gpus, form);

  const [pendingData, setPendingData] =
    useState<RawGpuReservationFormData | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (data: RawGpuReservationFormData) => {
    setPendingData(data);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!pendingData) return;
    await GpuReservationFormHandler(pendingData, form, {
      onSuccess,
      closeDialog,
    });
    setShowConfirm(false);
    setPendingData(null);
  };

  const dateRangeLabel =
    pendingData?.range?.from instanceof Date &&
    pendingData?.range?.to instanceof Date
      ? `${format(pendingData.range.from, "dd/MM/yyyy HH:mm")} - ${format(
          pendingData.range.to,
          "dd/MM/yyyy HH:mm"
        )}`
      : "Sin fecha";

  const selectedGpuNames = availableGpus
    .filter((gpu) => pendingData?.selectedGpuIds.includes(gpu.id))
    .map((gpu) => gpu.name);

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="max-w-lg mx-auto p-4 space-y-6 flex flex-col"
        >
          <DateRangePicker name="range" minDate={today} maxDate={maxDate} />
          <div className="flex gap-4">
            <TimePickerField
              name="startHour"
              label={t("Gpu.createReservation.startHour")}
              selectedHour=""
            />
            <TimePickerField
              name="endHour"
              label={t("Gpu.createReservation.endHour")}
              selectedHour=""
            />
          </div>
          <GpuSelector name="selectedGpuIds" availableGpus={availableGpus} />
          <div className="flex gap-4 justify-center">
            <Button
              type="submit"
              className="bg-green-app hover:bg-green-app-transparent w-40 max-w-xs"
            >
              {t("Gpu.createReservation.reserve")}
            </Button>
            <Button
              type="button"
              onClick={closeDialog}
              className="bg-red-app hover:bg-red-app-transparent w-40 max-w-xs"
            >
              {t("Gpu.createReservation.cancel")}
            </Button>
          </div>
        </form>
      </Form>

      {pendingData && (
        <ConfirmDialog
          open={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleConfirm}
          messageKey="confirm_reservation"
          params={{
            gpus: selectedGpuNames,
            dateRange: dateRangeLabel,
          }}
        />
      )}
    </>
  );
}
