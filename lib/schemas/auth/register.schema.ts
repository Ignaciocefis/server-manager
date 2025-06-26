import z from "zod";

export const formSchema = z.object({
  name: z.string().min(1, "Nombre obligatorio"),
  firstSurname: z.string().min(1, "Primer apellido obligatorio"),
  secondSurname: z.string().optional(),
  email: z.string().email("Correo no válido"),
  category: z.enum(["ADMIN", "JUNIOR", "RESEARCHER"]),
});