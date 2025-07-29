import { ServerListItem } from "@/features/server/types";
import axios from "axios";
import { toast } from "sonner";

export const toggleAvailability = async (
  serverId: string,
  setServer: (server: ServerListItem) => void,
  setError: (msg: string) => void
) => {
  await axios.put("/api/server/availability", {
    serverId,
  }).then((res) => {
    if (!res.data.success) {
      toast.error(res.data.error || "No se pudo cambiar la disponibilidad.");
      setError(res.data.error || "No se pudo cambiar la disponibilidad.");
      return;
    }

    console.log("Servidor actualizado:", res.data.data);

    toast.success(
      `Servidor ${res.data.data.available ? "disponible" : "en mantenimiento"}`
    );


    setServer(res.data.data);
  }).catch((error) => {
    toast.error(error.response?.data.error || "Error al cambiar la disponibilidad del servidor.");
    console.error("Error cambiando disponibilidad:", error);
    setError("No se pudo cambiar el estado del servidor.");
  });
};