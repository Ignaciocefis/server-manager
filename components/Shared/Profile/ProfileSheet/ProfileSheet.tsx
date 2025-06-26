"use client";

import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { ProfileSheetProps } from "./ProfileSheet.types";
import { formSchema } from "@/app/(home)/users-management/components/CreateUser/CreateUserForm.form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import axios from "axios";
import { toast } from "sonner";

export function ProfileSheet({ user }: ProfileSheetProps) {
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      firstSurname: user.firstSurname,
      secondSurname: user.secondSurname || "",
      email: user.email,
      category: user.category,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await axios.put("/api/auth/update/profile", data);

      const res = await axios.get("/api/auth/me");
      const updatedUser = res.data.user;

      form.reset(updatedUser);
      setIsEditing(false);

      toast.success("Perfil actualizado correctamente");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || "Error desconocido";
        toast.error(errorMessage);
      } else {
        toast.error("Error de red o inesperado");
      }
      console.error("Error al actualizar el perfil:", error);
    }
  };

  return (
    <SheetContent side="right" className="w-[80vw] max-w-lg">
      <SheetHeader>
        <SheetTitle>Mi perfil</SheetTitle>
      </SheetHeader>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-6 flex flex-col items-center gap-4 text-gray-app-600"
        >
          <div className="w-11/12">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={!isEditing}
                      className={`w-full ${isEditing ? "bg-white border border-gray-app-100" : "bg-gray-app-100 text-gray-app-400"} px-3 py-2 rounded text-sm`}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="w-11/12">
            <FormField
              control={form.control}
              name="firstSurname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primer Apellido</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={!isEditing}
                      className={`w-full ${isEditing ? "bg-white border border-gray-app-100" : "bg-gray-app-100 text-gray-app-400"} px-3 py-2 rounded text-sm`}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="w-11/12">
            <FormField
              control={form.control}
              name="secondSurname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Segundo Apellido</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly={!isEditing}
                      className={`w-full ${isEditing ? "bg-white border border-gray-app-100" : "bg-gray-app-100 text-gray-app-400"} px-3 py-2 rounded text-sm`}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="w-11/12">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      readOnly
                      type="email"
                      className={`w-full bg-gray-app-100 text-gray-app-400 px-3 py-2 rounded text-sm border ${isEditing ? "border-gray-300" : "border-transparent"}`}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="w-11/12">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled
                      className={`w-full bg-gray-app-100 text-gray-app-400 px-3 py-2 rounded text-sm border ${isEditing ? "border-gray-300" : "border-transparent"}`}
                    >
                      <option value="ADMIN">Administrador</option>
                      <option value="RESEARCHER">Investigador</option>
                      <option value="JUNIOR">Junior</option>
                    </select>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="w-11/12 mt-6 flex flex-col gap-4">
            {isEditing ? (
              <>
                <Button
                  type="submit"
                  className="w-full bg-gray-app-600 text-white hover:bg-gray-app-500"
                >
                  Guardar cambios
                </Button>
                <Button
                  type="button"
                  className="w-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
                  onClick={() => {
                    form.reset();
                    setIsEditing(false);
                  }}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button
                type="button"
                className="w-full bg-gray-app-600 text-white hover:bg-gray-app-500"
                onClick={(e) => {
                  e.preventDefault();
                  setIsEditing(true);
                }}
              >
                Editar Perfil
              </Button>
            )}
          </div>
        </form>
      </Form>
    </SheetContent>
  );
}
