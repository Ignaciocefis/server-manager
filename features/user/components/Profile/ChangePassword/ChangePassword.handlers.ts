import { changePasswordSchema } from "@/features/user/schemas";
import { useLanguage } from "@/hooks/useLanguage";
import { handleApiError } from "@/lib/services/errors/errors";
import axios from "axios";
import { toast } from "sonner";
import z from "zod";

export async function handleChangePassword(
  data: z.infer<ReturnType<typeof changePasswordSchema>>,
  onSuccess: () => void
) {
  await axios.put("/api/user/update/password", {
    currentPassword: data.currentPassword,
    newPassword: data.newPassword,
  }).then(() => {
    const { t } = useLanguage();
    toast.success(t("User.ChangePassword.changeSuccess"));
    onSuccess();
  }).catch((error) => {
    handleApiError(error, true);
  });
}
