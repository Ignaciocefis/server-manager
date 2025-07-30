import axios from "axios";
import { toast } from "sonner";
import { UserSummary } from "@/features/user/types";

export async function handleProfileUpdate(
  data: UserSummary,
  onSuccess: (user: UserSummary) => void
) {
  await axios.put("/api/user/update/profile", data)
    .then((res) => {
      if (!res.data.success) {
        toast.error(res.data.error || "Error al actualizar el perfil");
        return;
      }

    }).catch((error) => {
      console.error("Error al actualizar el perfil:", error);
      toast.error("Error al actualizar el perfil");
    });

  await axios.get("/api/auth/me")
    .then((res) => {
      if (!res.data.success) {
        toast.error(res.data.error || "Error al actualizar el perfil");
        return;
      }

      const updatedUser = res.data.data;

      toast.success("Perfil actualizado correctamente");
      onSuccess(updatedUser);
    }).catch((error) => {
      console.error("Error al obtener el usuario:", error);
      toast.error("Error al obtener el usuario");
    });
}
