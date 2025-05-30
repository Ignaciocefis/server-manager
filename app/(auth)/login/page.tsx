import { AppImage } from "@/components/Shared/AppImage";
import { LoginForm } from "./components/LoginForm";

export default function login() {
  return (
    <div className="flex flex-col items-center justify-center mt-20">
      <AppImage width={400} height={180} />
      <div className="text-5xl font-semibold text-gray-app-600 mt-20 mb-10">
        Iniciar sesión
      </div>
      <LoginForm />
      <div>Recuperar contraseña</div>
    </div>
  );
}
