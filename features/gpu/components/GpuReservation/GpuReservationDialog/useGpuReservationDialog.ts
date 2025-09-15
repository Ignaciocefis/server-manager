import { useState, useEffect } from "react";
import axios from "axios";
import { Gpu } from "@/features/gpu/types";
import { handleApiError } from "@/lib/services/errors/errors";

export function useAvailableGpus(open: boolean, serverId: string) {
  const [gpus, setGpus] = useState<Gpu[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchGpus = async () => {
      setLoading(true);
      await axios.get(`/api/server/details?serverId=${serverId}`)
        .then(res => {
          setGpus(res.data.data.data.gpus ?? []);
        })
        .catch(error => {
          handleApiError(error, true);
          setGpus([]);
        })
        .finally(() => setLoading(false));
    };

    fetchGpus();
  }, [open, serverId]);

  return { gpus, loading };
}
