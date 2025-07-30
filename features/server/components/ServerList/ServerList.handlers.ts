import axios from "axios";
import { ServerListItem } from "./ServerList.types";
import { toast } from "sonner";

export const fetchServers = async (): Promise<ServerListItem[]> => {
  return await axios.get(
    "/api/server/list"
  ).then((response) => {
    if (!response.data.success) {
      console.error(response.data.error || "Error al obtener la lista de servidores");
      toast.error(response.data.error || "Error al obtener la lista de servidores");
      return [];
    }
    return response.data.data;
  }).catch((error) => {
    console.error("Error al cargar servidores:", error);
    return [];
  });
};
