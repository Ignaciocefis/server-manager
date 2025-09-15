import { ServerListItem } from "@/features/server/types";
import { handleApiError } from "@/lib/services/errors/errors";
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
    toast.success(
      `Servidor ${res.data.data.available ? "disponible" : "en mantenimiento"}`
    );

    setServer(res.data.data);
  }).catch((error) => {
    const msg = handleApiError(error, true);
    setError(msg);
  });
};