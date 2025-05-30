import z from "zod";

export const formSchema = z.object({
  email: z.string().email({ message: "Debe ser un email válido." }).min(2, { message: "El email es muy corto." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});