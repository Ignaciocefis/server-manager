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
import { createServerFormSchema } from "@/lib/schemas/server/create.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { CircleMinus, CirclePlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DialogClose } from "@radix-ui/react-dialog";
import { z } from "zod";
import { CreateGpuForm } from "../../Gpu";

export function CreateServerForm({
  closeDialog,
}: {
  closeDialog?: () => void;
}) {
  const router = useRouter();

  const form = useForm<z.infer<typeof createServerFormSchema>>({
    resolver: zodResolver(createServerFormSchema),
    defaultValues: {
      name: "",
      ramGB: 1,
      diskCount: 1,
      gpus: [{ name: "", type: "", ramGB: 1 }],
    },
  });

  const onSubmit = async (data: z.infer<typeof createServerFormSchema>) => {
    try {
      const response = await axios.post("/api/server/create", data);
      toast.success(response.data.message || "Servidor creado correctamente");

      closeDialog?.();

      const newServerId = response.data.server?.id;
      if (newServerId) {
        router.push(`/servers/${newServerId}`);
      }
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

        <CreateGpuForm />

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
