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
import { useState, useEffect } from "react";
import { ProfileSheetProps } from "./ProfileSheet.types";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import axios from "axios";
import { toast } from "sonner";
import { ChangePassword } from "../ChangePassword";
import { formSchema } from "@/lib/schemas/auth/register.schema";

export function ProfileSheet({ user }: ProfileSheetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [researcherName, setResearcherName] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      firstSurname: user.firstSurname,
      secondSurname: user.secondSurname || "",
      email: user.email,
      category: user.category,
      assignedToId: user.assignedToId || null,
    },
  });

  const category = form.watch("category");
  const assignedToId = form.watch("assignedToId");

  useEffect(() => {
    const fetchResearcher = async () => {
      if (category === "JUNIOR" && assignedToId) {
        try {
          const res = await axios.get(
            `/api/researcher/findResearcher?id=${assignedToId}`
          );
          const researcher = res.data.user;
          setResearcherName(`${researcher.name} ${researcher.firstSurname}`);
        } catch (error) {
          console.error("Error al cargar el investigador:", error);
          setResearcherName("No disponible");
        }
      } else {
        setResearcherName(null);
      }
    };

    fetchResearcher();
  }, [category, assignedToId]);

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
                      className="w-full bg-gray-app-100 text-gray-app-400 px-3 py-2 rounded text-sm border border-transparent"
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

          {category === "JUNIOR" && researcherName && (
            <div className="w-11/12">
              <FormItem>
                <FormLabel>Investigador asignado</FormLabel>
                <div className="px-3 py-2 text-sm rounded bg-gray-app-100 text-gray-app-500 border border-gray-200">
                  {researcherName}
                </div>
              </FormItem>
            </div>
          )}

          <div className="w-11/12 mt-6 flex flex-col gap-4">
            {isEditing ? (
              <>
                <Button
                  type="submit"
                  className="w-full bg-green-app-500 text-white"
                >
                  Guardar cambios
                </Button>
                <Button
                  type="button"
                  className="w-full bg-red-app-500 text-white"
                  onClick={() => {
                    form.reset();
                    setIsEditing(false);
                  }}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  className="w-full bg-gray-app-600 text-white"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsEditing(true);
                  }}
                >
                  Editar Perfil
                </Button>
                <Button
                  type="button"
                  className="w-full bg-gray-app-600 text-white"
                  onClick={() => setIsPasswordDialogOpen(true)}
                >
                  Cambiar contraseña
                </Button>
              </>
            )}
          </div>
        </form>
      </Form>

      <ChangePassword
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      />
    </SheetContent>
  );
}
