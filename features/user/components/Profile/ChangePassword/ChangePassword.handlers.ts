import { changePasswordSchema } from "@/features/user/schemas";
import { handleApiError } from "@/lib/services/errors/errors";
import axios from "axios";
import { toast } from "sonner";
import z from "zod";

export async function handleChangePassword(
  data: z.infer<typeof changePasswordSchema>,
  onSuccess: () => void
) {
  await axios.put("/api/user/update/password", {
    currentPassword: data.currentPassword,
    newPassword: data.newPassword,
  }).then(() => {
    toast.success("Contraseña actualizada correctamente");
    onSuccess();
  }).catch((error) => {
    handleApiError(error, true);
  });
}
