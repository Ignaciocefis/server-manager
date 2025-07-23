"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { PlusCircle, XCircle } from "lucide-react";

export function GpuForm() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "gpus",
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Tarjetas gráficas</h3>
        <Button
          type="button"
          onClick={() => append({ name: "", type: "", ramGB: 1 })}
          variant="outline"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir GPU
        </Button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <Card key={field.id}>
            <CardContent className="pt-4 space-y-4">
              <FormField
                name={`gpus.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  name={`gpus.${index}.ramGB`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RAM (GB)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value ?? 1}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name={`gpus.${index}.type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-center items-center pt-2">
                <Button
                  type="button"
                  onClick={() => {
                    if (fields.length > 1) remove(index);
                  }}
                  disabled={fields.length === 1}
                  className={`w-40 ${
                    fields.length === 1
                      ? "opacity-50 cursor-not-allowed"
                      : "bg-red-app-500 hover:bg-red-app-500-transparent"
                  }`}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
