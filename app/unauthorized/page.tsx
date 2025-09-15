"use client";

import { ErrorPage } from "@/components/Shared";

export default function UnauthorizedPage() {
  return (
    <ErrorPage
      title="No tienes permiso"
      description="No estás autorizado para acceder a esta página. Contacta con un administrador si crees que esto es un error."
    />
  );
}
