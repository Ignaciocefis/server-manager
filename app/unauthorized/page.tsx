"use client";

import { ErrorPage } from "@/components/Shared";
import { useLanguage } from "@/hooks/useLanguage";

export default function UnauthorizedPage() {
  const { t } = useLanguage();

  return (
    <ErrorPage
      title={t("Error.unauthorized.title")}
      description={t("Error.unauthorized.description")}
    />
  );
}
