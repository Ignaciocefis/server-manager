import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { TimePickerFieldProps } from "./TimePickerField.types";

export function TimePickerField({
  name,
  label,
  selectedHour,
}: TimePickerFieldProps) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className="flex-1">
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="time"
              {...field}
              value={field.value ?? selectedHour}
              onChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
