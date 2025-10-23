"use client";

import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";

import { loginFormSchema } from "../../schemas";
import { z } from "zod";
import { handleApiError } from "@/lib/services/errors/errors";
import { useLanguage } from "@/hooks/useLanguage";

export function useLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { t } = useLanguage();

  type LoginFormValues = {
    email: string;
    password: string;
  };

  const schema = loginFormSchema(t);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    const result = schema.safeParse(values);

    if (!result.success) {
      toast.error(t("app.auth.invalidValues"));
      return;
    }

    const { email, password } = result.data;

    await axios.get("/api/auth/isActive", {
      params: { email },
    }).then(async (result) => {
      if (!result?.data?.data?.isActive) {
        toast.error(t("app.auth.userInactive"));
        return;
      }
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });
      if (res?.error) {
        toast.error(t("app.auth.invalidCredentials"));
      } else {
        toast.success(t("app.auth.successLogin"));
        router.push(res.url || "/");
      }
    }).catch((error) => {
      handleApiError(error);
    });
  };

  return {
    form,
    onSubmit,
  };
}
