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
  onBlur,
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
              onBlur={(event) => {
                field.onBlur();
                onBlur?.(event);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
