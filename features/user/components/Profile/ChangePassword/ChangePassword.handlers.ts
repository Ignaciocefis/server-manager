import { changePasswordSchema } from "@/features/user/schemas";
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
    toast.success("Password changed successfully");
    onSuccess();
  }).catch((error) => {
    console.error(error);
    toast.error(error.response?.data?.message || "Error changing password");
  });
}
