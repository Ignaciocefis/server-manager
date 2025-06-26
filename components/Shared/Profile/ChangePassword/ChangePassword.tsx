"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ChangePasswordProps } from "./ChangePassword.types";
import { formSchema } from "./ChangePassword.form";
import { z } from "zod";

export function ChangePassword({ open, onOpenChange }: ChangePasswordProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { handleSubmit, reset } = form;

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await axios.put("/api/auth/update/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast.success("Contraseña actualizada correctamente");
      onOpenChange(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Error desconocido");
      } else {
        toast.error("Error al cambiar la contraseña");
      }
      console.error("Cambio de contraseña:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Cambiar contraseña</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña actual</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar nueva contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex flex-row justify-center gap-4 mt-8 w-full">
              <Button
                type="submit"
                className="w-40 bg-green-app-500 hover:bg-green-app-500-transparent text-white"
              >
                Guardar
              </Button>
              <Button
                type="button"
                className="w-40 bg-red-app-500 hover:bg-red-app-500-transparent"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
