import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { GpuReservationProps } from "./GpuSelector.types";

export function GpuSelector({ name, availableGpus }: GpuReservationProps) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>GPUs disponibles</FormLabel>
          <FormControl>
            <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-2">
              {availableGpus.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay GPUs disponibles en el rango seleccionado.
                </p>
              ) : (
                availableGpus.map((gpu) => {
                  const checked = field.value?.includes(gpu.id);
                  const toggle = (checked: boolean) => {
                    const current = new Set(field.value ?? []);
                    if (checked) current.add(gpu.id);
                    else current.delete(gpu.id);
                    field.onChange(Array.from(current));
                  };
                  return (
                    <div key={gpu.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`gpu-${gpu.id}`}
                        checked={checked}
                        onCheckedChange={toggle}
                      />
                      <Label htmlFor={`gpu-${gpu.id}`}>{gpu.name}</Label>
                    </div>
                  );
                })
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
