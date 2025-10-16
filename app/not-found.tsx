"use client";

import { ErrorPage } from "@/components/Shared";
import { useLanguage } from "@/hooks/useLanguage";
import { XCircle } from "lucide-react";

export default function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <ErrorPage
      title={t("Error.notFound.title")}
      description={t("Error.notFound.description")}
      icon={<XCircle className="w-16 h-16 text-red-app" />}
    />
  );
}
