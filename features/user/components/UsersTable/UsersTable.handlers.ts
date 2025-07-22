import axios from "axios";
import { toast } from "sonner";

export async function handleDeleteUser(
  userId: string,
  refetch: () => void
) {
  await axios.delete("/api/user/delete", {
    data: { userId },
  }).then((res) => {
    if (!res.data.success) {
      throw new Error(res.data.message || "Error al eliminar el usuario");
    }
    
    toast.success("Usuario eliminado correctamente.");
    refetch();
  }).catch((error) => {
    console.error("Error al eliminar usuario:", error);
    toast.error("No se pudo eliminar el usuario.");
  });
}

export async function handleToggleActive(
  userId: string,
  newStatus: boolean,
  refetch: () => void
) {
  await axios.patch("/api/user/toggleActive", {
    userId,
  }).then((res) => {
    if (!res.data.success) {
      toast.error(res.data.message || "Error al cambiar el estado del usuario");
      return;
    }

    toast.success(`Usuario ${newStatus ? "activado" : "desactivado"}`);
    refetch();
  }).catch((error) => {
    console.error("Error al cambiar estado del usuario:", error)
    toast.error("No se pudo cambiar el estado del usuario.");
  });
}
