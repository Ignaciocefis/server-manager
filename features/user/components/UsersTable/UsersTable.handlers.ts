import { handleApiError } from "@/lib/services/errors/errors";
import axios from "axios";
import { toast } from "sonner";

export async function handleDeleteUser(
  userId: string,
) {
  await axios.delete("/api/user/delete", {
    data: { userId },
  }).then(() => {
    toast.success("Usuario eliminado correctamente.");
  }).catch((error) => {
    handleApiError(error, true);
  });
}

export async function handleToggleActive(
  userId: string,
) {
  await axios.patch("/api/user/toggleActive", {
    userId,
  }).then((res) => {
    if (!res.data.success) {
      toast.error(res.data.message || "Error al cambiar el estado del usuario");
      return;
    }

    toast.success(`Usuario ${res.data.data ? "activado" : "desactivado"}`);
  }).catch((error) => {
    console.error("Error al cambiar estado del usuario:", error)
    toast.error(error.response?.data?.error || "No se pudo cambiar el estado del usuario.");
  });
}
