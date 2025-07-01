"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ServerListItem } from "./ServerList.types";
import ServerCard from "@/components/Shared/Server/ServerCard/ServerCard";

export function ServerList() {
  const [servers, setServers] = useState<ServerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const user = await axios.get("/api/auth/me");
        const userId = user.data?.user?.id;

        const serverListResponse = await axios.get(
          `/api/server/list?id=${userId}`
        );
        setServers(serverListResponse.data);
      } catch (err) {
        console.error("Error al cargar servidores:", err);
        setError("No se pudieron cargar los servidores.");
      } finally {
        setLoading(false);
      }
    };

    fetchServers();
  }, []);

  if (loading) {
    return <p className="p-4">Cargando servidores...</p>;
  }

  if (error) {
    return <p className="p-4 text-red-500">{error}</p>;
  }

  if (servers.length === 0) {
    return <p className="p-4">No tienes servidores asignados.</p>;
  }

  return (
    <div className="w-11/12 m-4 grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))] items-center place-items-center">
      {servers.map((server: ServerListItem) => (
        <ServerCard key={server.id} server={server} />
      ))}
    </div>
  );
}
