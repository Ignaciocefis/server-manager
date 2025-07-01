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
import { updateServerFormSchema } from "@/lib/schemas/server/update.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { CircleMinus, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { DialogClose } from "@radix-ui/react-dialog";
import { z } from "zod";
import { UpdateServerFormProps } from "./UpdateServerForm.types";

export function UpdateServerForm({
  serverToEdit,
  closeDialog,
  onUpdate,
}: UpdateServerFormProps) {
  const form = useForm<z.infer<typeof updateServerFormSchema>>({
    resolver: zodResolver(updateServerFormSchema),
    defaultValues: {
      serverId: serverToEdit!.id,
      name: serverToEdit!.name,
      ramGB: serverToEdit!.ramGB,
      diskCount: serverToEdit!.diskCount,
      available: serverToEdit!.available,
    },
  });

  const onSubmit = async (data: z.infer<typeof updateServerFormSchema>) => {
    try {
      const response = await axios.put("/api/server/update", {
        ...data,
      });
      toast.success(
        response.data.message || "Servidor actualizado correctamente"
      );

      if (response.data.server && onUpdate) {
        onUpdate(response.data.server);
      }

      closeDialog?.();
    } catch (error: unknown) {
      console.error({ error });
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "Error desconocido";
        toast.error(errorMessage);
      } else {
        toast.error("Error de red o inesperado");
      }
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <input type="hidden" {...form.register("serverId")} />
        <div className="space-y-6">
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

        <div className="md:col-span-2 flex justify-center gap-4 mt-4">
          <Button
            type="submit"
            className="w-40 bg-green-app-500 hover:bg-green-app-500-transparent"
          >
            <Save />
            Actualizar servidor
          </Button>
          <DialogClose asChild>
            <Button
              type="button"
              className="w-40 bg-red-app-500 hover:bg-red-app-500-transparent"
            >
              <CircleMinus />
              Cancelar
            </Button>
          </DialogClose>
        </div>
      </form>
    </Form>
  );
}
