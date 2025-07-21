import z from "zod";

export const signInSchema = z.object({
  email: z.string({required_error: "Email requerido"}).email("Formato de email inválido").min(1, "Email requerido"),
  password: z.string({required_error: "Contraseña requerida"}).min(6, "Contraseña debe tener al menos 6 caracteres")
});

export const createUserSchema = z
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

export const updateUserSchema = z.object({
  name: z.string().min(1, "Nombre obligatorio"),
  firstSurname: z.string().min(1, "Primer apellido obligatorio"),
  secondSurname: z.string().optional(),
});

export const updateUserPasswordSchema = z.object({
  currentPassword: 
    z.string().min(1, "La contraseña actual es obligatoria"),
  newPassword: 
    z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
});

export const assignResearcherFormSchema = z.object({
  userId: z.string().min(1, "El ID del junior es requerido"),
  researcherId: z.string().min(1, "El ID del investigador es requerido"),
});