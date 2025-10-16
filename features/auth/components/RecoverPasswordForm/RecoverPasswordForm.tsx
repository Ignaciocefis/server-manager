"use client";

import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";

const formSchema = z.object({
  email: z.string().email("El correo no es válido"),
});

type RecoverPasswordFormData = z.infer<typeof formSchema>;

export function RecoverPasswordForm() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<RecoverPasswordFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: RecoverPasswordFormData) => {
    setLoading(true);

    try {
      await axios.post("/api/auth/changePassword", { email: values.email });
      toast.success(t("Auth.RecoverPassword.recoverySuccess"));
      form.reset();
    } catch (error) {
      console.error(error);
      toast.error(t("Auth.RecoverPassword.recoveryError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span className="text-sm text-gray-app-500 cursor-pointer hover:underline">
          {t("Auth.RecoverPassword.forgotPassword")}
        </span>
      </DialogTrigger>

      <DialogContent className="flex flex-col items-center justify-center bg-white rounded-lg shadow-lg">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-4">
            <Mail className="w-8 h-8 text-blue-app" />
            <DialogTitle className="text-2xl font-bold">
              {t("Auth.RecoverPassword.recoverPasswordTitle")}
            </DialogTitle>
          </div>
          <DialogDescription className="md:ml-12 -ml-7">
            {t("Auth.RecoverPassword.recoverPasswordDesc")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-4/5 mx-auto gap-4 flex flex-col text-gray-app-600"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">
                    {t("Auth.RecoverPassword.email")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("Auth.RecoverPassword.exampleEmail")}
                      {...field}
                      className="bg-gray-app-100"
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={loading}
              className="bg-gray-app-100 text-gray-app-600 font-bold hover:bg-gray-app-200 shadow-md cursor-pointer flex justify-center mx-auto"
            >
              {loading
                ? t("Auth.RecoverPassword.sending")
                : t("Auth.RecoverPassword.sendRecoveryEmail")}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
