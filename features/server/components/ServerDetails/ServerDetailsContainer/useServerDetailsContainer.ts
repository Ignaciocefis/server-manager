"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { UseServerDetailsResult } from "./ServerDetailsContainer.types";
import { ServerListItem } from "@/features/server/types";
import { toast } from "sonner";

export const useServerDetails = (): UseServerDetailsResult => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [server, setServer] = useState<ServerListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const serverId = server?.id;

  useEffect(() => {
    if (!serverId) return;

    const fetchServer = async () => {
      setLoading(true);

      await axios.get("/api/auth/me")
      .then((res) => {
        if(!res.data.success){
          setError("No se pudo identificar al usuario.");
          toast.error(res.data.error || "No se pudo identificar al usuario.");
          setLoading(false);
          return;
        }
        setIsAdmin(res.data.data.category === "ADMIN");
      })
      .catch((err) => {
        console.error("Error al obtener datos del usuario:", err);
        setError("No se pudo identificar al usuario.");
        toast.error("Error al obtener datos del usuario.");
        setLoading(false);
      });

      await axios.get(`/api/server/details?serverId=${serverId}`)
      .then((res) => {
        if (!res.data.success) {
          setError(res.data.error || "No se pudieron cargar los detalles del servidor.");
          toast.error(res.data.error || "No se pudieron cargar los detalles del servidor.");
          return;
        }
        setServer(res.data.data);
      })
      .catch((err) => {
        console.error("Error al obtener detalles del servidor:", err);
        setError("No se pudieron cargar los detalles del servidor.");
        toast.error("Error al obtener detalles del servidor.");
      }).finally(() => {
        setLoading(false);
      });
    };

    fetchServer();
  }, [serverId, refreshKey]);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  return {
    server,
    loading,
    error,
    isAdmin,
    triggerRefresh,
    setServer,
  };
};
