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

import { useEffect } from "react";
import { ChangePasswordProps } from "./ChangePassword.types";
import { handleChangePassword } from "./ChangePassword.handlers";
import { useChangePasswordForm } from "./useChangePassword";

export function ChangePassword({ open, onOpenChange }: ChangePasswordProps) {
  const form = useChangePasswordForm();

  const { handleSubmit, reset } = form;

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const onSubmit = handleSubmit((data) =>
    handleChangePassword(data, () => onOpenChange(false))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Cambiar contraseña</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4 mt-4">
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
