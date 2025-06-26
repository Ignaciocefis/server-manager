import z from "zod";

export const formSchema = z.object({
  currentPassword: 
    z.string().min(1, "La contraseña actual es obligatoria"),
  newPassword: 
    z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
});