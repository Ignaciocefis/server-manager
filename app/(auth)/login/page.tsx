"use client";

import { AppImage } from "@/components/Shared/AppImage";
import { LoginForm } from "./components/LoginForm";
import { Suspense } from "react";

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-center mt-20">
      <AppImage width={400} height={180} />
      <div className="text-5xl font-semibold text-gray-app-600 mt-20 mb-10">
        Iniciar sesión
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
      <div>Recuperar contraseña</div>
    </div>
  );
}
