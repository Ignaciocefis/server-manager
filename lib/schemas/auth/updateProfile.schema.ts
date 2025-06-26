import z from "zod";

export const formSchema = z.object({
  name: z.string().min(1, "Nombre obligatorio"),
  firstSurname: z.string().min(1, "Primer apellido obligatorio"),
  secondSurname: z.string().optional(),
});