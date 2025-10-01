"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { LockKeyhole } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export function ChangePassword({ open, onOpenChange }: ChangePasswordProps) {
  const { t } = useLanguage();

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
          <div className="flex items-center gap-2">
            <LockKeyhole className="w-8 h-8 text-blue-app" />
            <DialogTitle className="text-2xl font-bold">
              {t("User.ChangePassword.title")}
            </DialogTitle>
          </div>
          <DialogDescription className="ml-10">
            {t("User.ChangePassword.description")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("User.ChangePassword.currentPassword")}
                  </FormLabel>
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
                  <FormLabel>{t("User.ChangePassword.newPassword")}</FormLabel>
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
                  <FormLabel>
                    {t("User.ChangePassword.confirmNewPassword")}
                  </FormLabel>
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
                className="w-40 bg-green-app-100 text-gray-app-600 font-bold hover:bg-green-app shadow-md cursor-pointer"
              >
                {t("User.ChangePassword.saveChanges")}
              </Button>
              <Button
                type="button"
                className="w-40 bg-red-app-100 text-gray-app-600 font-bold hover:bg-red-app shadow-md cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                {t("User.ChangePassword.cancel")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
