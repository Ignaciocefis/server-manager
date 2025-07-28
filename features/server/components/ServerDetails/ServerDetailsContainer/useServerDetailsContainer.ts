"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { UseServerDetailsResult } from "./ServerDetailsContainer.types";
import { ServerListItem } from "@/features/server/types";
import { toast } from "sonner";

export const useServerDetails = (serverId: string): UseServerDetailsResult => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [server, setServer] = useState<ServerListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!serverId) return;

    setLoading(true);

    Promise.all([
      axios.get("/api/auth/me"),
      axios.get(`/api/server/details?serverId=${serverId}`),
    ])
      .then(([authRes, serverRes]) => {
        if (!authRes.data.success) {
          setError("No se pudo identificar al usuario.");
          toast.error(authRes.data.error || "No se pudo identificar al usuario.");
        } else {
          setIsAdmin(authRes.data.data.category === "ADMIN");
        }

        if (!serverRes.data.success) {
          setError(serverRes.data.error || "No se pudieron cargar los detalles del servidor.");
          toast.error(serverRes.data.error || "No se pudieron cargar los detalles del servidor.");
        } else {
          setServer(serverRes.data.data.data);
        }
      })
      .catch((err) => {
        console.error("Error al obtener información:", err);
        setError("Error general al obtener los datos del servidor.");
        toast.error("Error general al obtener los datos del servidor.");
      })
      .finally(() => {
        setLoading(false);
      });
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
