"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { DialogClose } from "@radix-ui/react-dialog";
import { CircleMinus, CirclePlus } from "lucide-react";
import { useWatch } from "react-hook-form";

import { ComboboxResearchers } from "@/components/Shared/FormItems/ComboboxResearchers/ComboboxResearchers";
import { handleCreateUser } from "./CreateUserForm.handlers";
import { CreateUserFormProps } from "./CreateUserForm.types";
import { useCreateUserForm } from "./hooks/useCreateUserForm";
import { useFetchResearchers } from "./hooks/useFetchResearchers";

export function CreateUserForm({
  closeDialog,
  onSuccess,
}: CreateUserFormProps) {
  const { form } = useCreateUserForm();

  const selectedCategory = useWatch({
    control: form.control,
    name: "category",
  });

  const { researchers } = useFetchResearchers(selectedCategory);

  const onSubmit = form.handleSubmit((data) =>
    handleCreateUser(data, onSuccess, closeDialog)
  );

  return (
    <Form {...form}>
      <form
        onSubmit={onSubmit}
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
            className="w-40 bg-green-app hover:bg-green-app-transparent"
          >
            <CirclePlus />
            Añadir usuario
          </Button>
          <DialogClose asChild>
            <Button
              type="button"
              className="w-40 bg-red-app hover:bg-red-app-transparent"
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
