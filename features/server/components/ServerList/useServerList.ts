import { useEffect, useState } from "react";
import { ServerListItem } from "./ServerList.types";
import { fetchServers } from "./ServerList.handlers";

export const useServerList = () => {
  const [servers, setServers] = useState<ServerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadServers = async () => {
      try {
        const data = await fetchServers();
        setServers(data);
      } catch (err) {
        setError(
          err && typeof err === "object" && "message" in err
            ? (err as { message: string }).message
            : "Error desconocido"
        );
      } finally {
        setLoading(false);
      }
    };

    loadServers();
  }, []);

  return {
    servers,
    loading,
    error,
  };
};
