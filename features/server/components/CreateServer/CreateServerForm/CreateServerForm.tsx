"use client";

import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@radix-ui/react-dialog";
import { CirclePlus, CircleMinus } from "lucide-react";
import { useCreateServerForm } from "./useCreateServerForm";
import { GpuForm } from "@/app/(home)/components";

export function CreateServerForm({
  closeDialog,
}: {
  closeDialog?: () => void;
}) {
  const { form, onSubmit } = useCreateServerForm(closeDialog);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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

        <div className="flex justify-center gap-4 mt-6">
          <Button
            type="submit"
            className="w-40 bg-green-app-500 hover:bg-green-app-500-transparent"
          >
            <CirclePlus className="mr-2" />
            Añadir servidor
          </Button>
          <DialogClose asChild>
            <Button
              type="button"
              className="w-40 bg-red-app-500 hover:bg-red-app-500-transparent"
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
