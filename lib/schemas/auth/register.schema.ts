import { z } from "zod";

export const formSchema = z
  .object({
    email: z.string().email("Correo inválido"),
    name: z.string().min(1, "El nombre es obligatorio"),
    firstSurname: z.string().min(1, "El primer apellido es obligatorio"),
    secondSurname: z.string().optional(),
    category: z.enum(["JUNIOR", "RESEARCHER", "ADMIN"]),
    assignedToId: z.string().optional().nullable(),
  })
  .superRefine(({ category, assignedToId }, ctx) => {
    if (category === "JUNIOR") {
      if (!assignedToId || assignedToId.trim() === "") {
        ctx.addIssue({
          path: ["assignedToId"],
          code: "custom",
          message: "Un Junior debe tener un investigador asignado",
        });
      }
    }
  });
