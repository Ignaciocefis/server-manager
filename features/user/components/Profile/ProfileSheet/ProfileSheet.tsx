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

import { useState } from "react";
import { ChangePassword } from "../ChangePassword/ChangePassword";
import { useProfileForm } from "./hooks/useProfileForm";
import { handleProfileUpdate } from "./ProfileSheet.handlers";
import { useAssignedResearcher } from "./hooks/useAssignedResearcher";
import { UserSummary } from "@/features/user/types";

export function ProfileSheet({ user }: { user: UserSummary }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const form = useProfileForm(user);
  const { handleSubmit, reset, watch } = form;

  const category = watch("category");
  const assignedToId = watch("assignedToId");
  const researcherName = useAssignedResearcher(category, assignedToId ?? null);

  const onSubmit = handleSubmit((data) => {
    handleProfileUpdate(
      {
        ...data,
        id: user.id,
        secondSurname: data.secondSurname ?? null,
        assignedToId: data.assignedToId ?? null,
      },
      (updatedUser) => {
        reset({
          ...updatedUser,
          secondSurname: updatedUser.secondSurname ?? undefined,
          assignedToId: updatedUser.assignedToId ?? undefined,
        });
        setIsEditing(false);
      }
    );
  });

  return (
    <SheetContent side="right" className="w-[80vw] max-w-lg">
      <SheetHeader>
        <SheetTitle>Mi perfil</SheetTitle>
      </SheetHeader>

      <Form {...form}>
        <form
          onSubmit={onSubmit}
          className="mt-6 flex flex-col items-center gap-4 text-gray-app-600"
        >
          {(
            ["name", "firstSurname", "secondSurname", "email"] as Array<
              "name" | "firstSurname" | "secondSurname" | "email"
            >
          ).map((fieldName) => (
            <div key={fieldName} className="w-11/12">
              <FormField
                control={form.control}
                name={fieldName}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {
                        {
                          name: "Nombre",
                          firstSurname: "Primer Apellido",
                          secondSurname: "Segundo Apellido",
                          email: "Email",
                        }[fieldName]
                      }
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type={fieldName === "email" ? "email" : "text"}
                        readOnly={!isEditing || fieldName === "email"}
                        className={`w-full px-3 py-2 rounded text-sm ${
                          fieldName === "email"
                            ? "bg-gray-app-100 text-gray-app-400"
                            : isEditing
                              ? "bg-white border border-gray-app-100"
                              : "bg-gray-app-100 text-gray-app-400"
                        }`}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          ))}

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
                    reset();
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
                  onClick={() => setIsEditing(true)}
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
