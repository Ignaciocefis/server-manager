"use client";

import { LanguageSwitcher } from "@/components/Shared";
import { LoginForm } from "@/features/auth/components";
import { useLanguage } from "@/hooks/useLanguage";
import { Suspense } from "react";

export default function Login() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center gap-6 bg-white p-8 rounded-lg shadow-lg relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold text-gray-app-600">
          {t("app.auth.login")}
        </h1>
        <span className="text-sm text-gray-app-500">
          {t("app.auth.credentials")}
        </span>
      </div>
      <Suspense fallback={<div>{t("app.auth.loading")}</div>}>
        <LoginForm />
      </Suspense>
      <hr className="border-gray-app-300 w-4/5 mx-auto my-4" />
      <div className="flex items-center justify-center">
        <span className="text-xs text-center text-muted-foreground mt-2">
          {t("app.auth.noAccess")}
        </span>
      </div>
    </div>
  );
}
