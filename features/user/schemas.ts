import z from "zod";

export const createUserSchema = z
  .object({
    email: z.string().email("Correo inválido"),
    name: z.string().min(1, "El nombre es obligatorio").max(50, "El nombre no puede tener más de 50 caracteres"),
    firstSurname: z.string().min(1, "El primer apellido es obligatorio").max(50, "El primer apellido no puede tener más de 50 caracteres"),
    secondSurname: z.string().max(50, "El segundo apellido no puede tener más de 50 caracteres").optional(),
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

export const updateUserProfileSchema = (t: (path: string) => string) => z.object({
  name: z.string().min(1, t("User.Schemas.nameRequired")).max(50, t("User.Schemas.nameTooLong")),
  firstSurname: z.string().min(1, t("User.Schemas.firstSurnameRequired")).max(50, t("User.Schemas.firstSurnameTooLong")),
  secondSurname: z.string().max(50, t("User.Schemas.secondSurnameTooLong")).optional(),
  email: z.string().min(1, t("User.Schemas.emailRequired")).email(t("User.Schemas.invalidEmail")),
  category: z.enum(["JUNIOR", "RESEARCHER", "ADMIN"]),
  assignedToId: z.string().optional().nullable(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1, "Nombre obligatorio"),
  firstSurname: z.string().min(1, "Primer apellido obligatorio"),
  secondSurname: z.string().optional(),
});

export const changePasswordSchema = (t: (path: string) => string) => z.object({
  currentPassword:
    z.string().min(1, t("User.Schemas.currentPassword")),
  newPassword:
    z.string().min(6, t("User.Schemas.newPasswordMin")).max(20, t("User.Schemas.newPasswordMax")),
  confirmPassword:
    z.string().min(1, t("User.Schemas.confirmNewPassword")),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: t("User.Schemas.passwordsDoNotMatch"),
  path: ["confirmPassword"],
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