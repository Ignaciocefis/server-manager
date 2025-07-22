import { changePasswordSchema } from "@/features/user/schemas";
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
  }).then((res) => {
    if (!res.data.success) {
      toast.error(res.data.error || "Error al cambiar la contraseña");
      return;
    }

    toast.success("Contraseña actualizada correctamente");
    onSuccess();
  }).catch((error) => {
    console.error("Error al cambiar la contraseña:", error);
    toast.error("Error al cambiar la contraseña");
  });
}
