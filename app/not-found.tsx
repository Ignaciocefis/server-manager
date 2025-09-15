"use client";

import { ErrorPage } from "@/components/Shared";
import { XCircle } from "lucide-react";

export default function NotFoundPage() {
  return (
    <ErrorPage
      title="Página no encontrada"
      description="La página que buscas no existe. Verifica la URL o vuelve al inicio."
      icon={<XCircle className="w-16 h-16 text-red-app" />}
    />
  );
}
