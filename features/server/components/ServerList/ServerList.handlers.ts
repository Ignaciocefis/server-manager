import axios from "axios";
import { ServerListItem } from "./ServerList.types";

export const fetchServers = async (): Promise<ServerListItem[]> => {
  try {
    const user = await axios.get("/api/auth/me");
    const userId = user.data?.user?.id;

    const serverListResponse = await axios.get(
      `/api/server/list?id=${userId}`
    );

    return serverListResponse.data.data.data;
  } catch (error) {
    console.error("Error al cargar servidores:", error);
    throw new Error("No se pudieron cargar los servidores.");
  }
};
