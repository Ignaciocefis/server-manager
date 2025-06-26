import { object, string } from "zod";

export const signInSchema = object({
  email: string({required_error: "Email requerido"}).email("Formato de email inválido").min(1, "Email requerido"),
  password: string({required_error: "Contraseña requerida"}).min(6, "Contraseña debe tener al menos 6 caracteres")
});