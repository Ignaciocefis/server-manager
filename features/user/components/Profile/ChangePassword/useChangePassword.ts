import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changePasswordSchema } from "../../../schemas";
import z from "zod";
import { useLanguage } from "@/hooks/useLanguage";

export function useChangePasswordForm() {

  const { t } = useLanguage();

  const schema = changePasswordSchema(t);

  return useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

}
