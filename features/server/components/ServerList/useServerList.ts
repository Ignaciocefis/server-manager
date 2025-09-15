"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ServerListItem } from "./ServerList.types";
import { handleApiError } from "@/lib/services/errors/errors";

export const useServerList = () => {
  const [servers, setServers] = useState<ServerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServers = async () => {
    setLoading(true);
    setError(null);

    await axios
      .get("/api/server/list")
      .then((response) => {


        setServers(response.data.data ?? []);
      })
      .catch((err) => {
        const msg = handleApiError(err);
        setError(msg);
        setServers([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchServers();
  }, []);

  return { servers, loading, error, refresh: fetchServers };
};
