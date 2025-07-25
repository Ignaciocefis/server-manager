"use client";

import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formSchema } from "@/lib/schemas/auth/register.schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DialogClose } from "@radix-ui/react-dialog";
import { CircleMinus, CirclePlus } from "lucide-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { ComboboxResearchers } from "@/components/Shared/FormItems/ComboboxResearchers/ComboboxResearchers";
import { Researcher } from "@/components/Shared/FormItems/ComboboxResearchers/Researcher.types";

export function CreateUserForm({
  closeDialog,
  onSuccess,
}: {
  closeDialog?: () => void;
  onSuccess?: () => void;
}) {
  const [researchers, setResearchers] = useState<Researcher[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      firstSurname: "",
      secondSurname: "",
      category: "JUNIOR",
      assignedToId: "",
    },
  });

  const selectedCategory = useWatch({
    control: form.control,
    name: "category",
  });

  useEffect(() => {
    if (selectedCategory === "JUNIOR") {
      axios.get("/api/researcher/allResearchers").then((res) => {
        setResearchers(res.data.researchers || []);
      });
    }
  }, [selectedCategory]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post("/api/auth/register", data);

      closeDialog?.();
      onSuccess?.();
      toast.success(response.data.message || "Usuario creado correctamente");
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
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Correo electrónico</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
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

          <FormField
            control={form.control}
            name="firstSurname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primer Apellido</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="secondSurname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Segundo Apellido</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-6">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">Categoría</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="JUNIOR">Junior</SelectItem>
                    <SelectItem value="RESEARCHER">Investigador</SelectItem>
                    <SelectItem value="ADMIN">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedCategory === "JUNIOR" && (
            <FormField
              control={form.control}
              name="assignedToId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asignar a Investigador</FormLabel>
                  <FormControl>
                    <ComboboxResearchers
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      researchers={researchers}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="md:col-span-2 flex justify-center gap-4 mt-4">
          <Button
            type="submit"
            className="w-40 bg-green-app-500 hover:bg-green-app-500-transparent"
          >
            <CirclePlus />
            Añadir usuario
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
