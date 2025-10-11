import z from "zod";

export const createUserSchema = (t: (path: string) => string) => z.object({
  email: z.string().min(1, t("User.Schemas.emailRequired")).email(t("User.Schemas.emailInvalid")),
  name: z.string().min(1, t("User.Schemas.nameRequired")).max(50, t("User.Schemas.nameTooLong")),
  firstSurname: z.string().min(1, t("User.Schemas.firstSurnameRequired")).max(50, t("User.Schemas.firstSurnameTooLong")),
  secondSurname: z.string().max(50, t("User.Schemas.secondSurnameTooLong")).optional(),
  category: z.enum(["JUNIOR", "RESEARCHER", "ADMIN"]),
  assignedToId: z.string().optional().nullable(),
})
  .superRefine(({ category, assignedToId }, ctx) => {
    if (category === "JUNIOR") {
      if (!assignedToId || assignedToId.trim() === "") {
        ctx.addIssue({
          path: ["assignedToId"],
          code: "custom",
          message: t("User.Schemas.juniorMustHaveResearcherAssigned"),
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

export const updateUserSchema = (t: (path: string) => string) => z.object({
  name: z.string().min(1, t("User.Schemas.nameRequired")).max(50, t("User.Schemas.nameTooLong")),
  firstSurname: z.string().min(1, t("User.Schemas.firstSurnameRequired")).max(50, t("User.Schemas.firstSurnameTooLong")),
  secondSurname: z.string().max(50, t("User.Schemas.secondSurnameTooLong")).optional(),
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

export const updateUserPasswordSchema = (t: (path: string) => string) => z.object({
  currentPassword:
    z.string().min(1, t("User.Schemas.currentPassword")),
  newPassword:
    z.string().min(6, t("User.Schemas.newPasswordMin")).max(20, t("User.Schemas.newPasswordMax")),
});

export const assignResearcherFormSchema = (t: (path: string) => string) => z.object({
  userId: z.string().min(1, t("User.Schemas.juniorIdRequired")),
  researcherId: z.string().min(1, t("User.Schemas.researcherIdRequired")),
});