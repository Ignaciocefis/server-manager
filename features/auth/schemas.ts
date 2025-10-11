import z from "zod";

export const loginFormSchema = (t: (key: string) => string) => z.object({
  email: z.string().email({ message: t("Auth.Schema.emailInvalid") }).min(2, { message: t("Auth.Schema.emailTooShort") }),
  password: z.string().min(6, { message: t("Auth.Schema.passwordTooShort") }),
});