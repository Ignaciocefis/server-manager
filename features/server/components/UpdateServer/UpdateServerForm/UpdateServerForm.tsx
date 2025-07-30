"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DialogClose } from "@radix-ui/react-dialog";
import { Save, CircleMinus } from "lucide-react";
import { useUpdateServerFormSchema } from "./hooks/useUpdateServerFormSchema";
import { useUpdateServerForm } from "./hooks/useUpdateServerForm";
import { UpdateServerFormProps } from "./UpdateServerForm.types";
import { GpuForm } from "@/features/gpu/components";

export function UpdateServerForm({
  serverToEdit,
  closeDialog,
  onUpdate,
}: UpdateServerFormProps) {
  const form = useUpdateServerFormSchema(serverToEdit);
  const { onSubmit } = useUpdateServerForm({
    form,
    closeDialog,
    onUpdate,
  });

  if (!serverToEdit) {
    return null;
  }

  return (
    <Form {...form}>
      <form
        key={serverToEdit.id}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <input type="hidden" {...form.register("serverId")} />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg">Nombre del servidor</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="ramGB"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RAM (GB)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="diskCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad de Discos</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <GpuForm />

        <div className="flex justify-center gap-4 mt-4">
          <Button
            type="submit"
            className="w-40 bg-green-app hover:bg-green-app-transparent"
          >
            <Save className="mr-2" />
            Actualizar servidor
          </Button>
          <DialogClose asChild>
            <Button
              type="button"
              className="w-40 bg-red-app hover:bg-red-app-transparent"
            >
              <CircleMinus className="mr-2" />
              Cancelar
            </Button>
          </DialogClose>
        </div>
      </form>
    </Form>
  );
}
