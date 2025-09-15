"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { UseServerDetailsResult } from "./ServerDetailsContainer.types";
import { ServerListItem } from "@/features/server/types";
import { handleApiError } from "@/lib/services/errors/errors";

export const useServerDetails = (serverId: string): UseServerDetailsResult => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [server, setServer] = useState<ServerListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!serverId) return;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [authRes, serverRes] = await Promise.all([
          axios.get("/api/auth/me"),
          axios.get(`/api/server/details?serverId=${serverId}`),
        ]);

        if (!authRes.data.success) {
          throw new Error(authRes.data.error || "No se pudo identificar al usuario.");
        } else {
          setIsAdmin(authRes.data.data.category === "ADMIN");
        }

        if (!serverRes.data.success) {
          throw new Error(serverRes.data.error || "No se pudieron cargar los detalles del servidor.");
        } else {
          setServer(serverRes.data.data.data);
        }
      } catch (err) {
        const msg = handleApiError(err, true);
        setError(msg);
        setServer(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [serverId, refreshKey]);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  return { server, loading, error, isAdmin, triggerRefresh, setServer };
};
