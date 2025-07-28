"use client";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  GpuReservationFormProps,
  RawGpuReservationFormData,
} from "./GpuReservationForm.types";
import {
  DateRangePicker,
  GpuSelector,
  TimePickerField,
} from "@/components/Shared";
import { useDynamicTimeDefaults } from "./hooks/useDynamicTimeDefaults";
import { useAvailableGpus } from "./hooks/useAvailableGpus";
import { GpuReservationFormHandler } from "./GpuReservationForm.handlers";
import { useGpuReservationForm } from "./hooks/useGpuReservationForm";

export function GpuReservationForm({
  serverId,
  gpus,
  closeDialog,
  onSuccess,
}: GpuReservationFormProps) {
  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 30);

  const { form } = useGpuReservationForm(serverId);

  useDynamicTimeDefaults(form);

  const availableGpus = useAvailableGpus(gpus, form);

  const onSubmit = (data: RawGpuReservationFormData) =>
    GpuReservationFormHandler(data, form, { onSuccess, closeDialog });

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
            selectedHour=""
          />
          <TimePickerField name="endHour" label="Hora fin" selectedHour="" />
        </div>
        <GpuSelector name="selectedGpuIds" availableGpus={availableGpus} />
        <div className="flex gap-4 justify-center">
          <Button
            type="submit"
            className="bg-green-app hover:bg-green-app-transparent w-40 max-w-xs"
          >
            Reservar
          </Button>
          <Button
            type="button"
            onClick={closeDialog}
            className="bg-red-app hover:bg-red-app-transparent w-40 max-w-xs"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
}
