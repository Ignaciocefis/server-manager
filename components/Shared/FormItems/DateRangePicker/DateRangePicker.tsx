import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { DateRangePickerProps } from "./DateRangePicker.types";

export function DateRangePicker({
  name,
  minDate,
  maxDate,
}: DateRangePickerProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel>Selecciona un rango de fechas</FormLabel>
          <FormControl>
            <DayPicker
              mode="range"
              selected={field.value}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  field.onChange(range);
                }
              }}
              disabled={{ before: minDate, after: maxDate }}
              className="rounded-md border border-gray-300 p-4"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
