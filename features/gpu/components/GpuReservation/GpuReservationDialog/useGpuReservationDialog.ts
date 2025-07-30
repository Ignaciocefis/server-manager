import { useState, useEffect } from "react";
import axios from "axios";
import { Gpu } from "@/features/gpu/types";
import { toast } from "sonner";

export function useAvailableGpus(open: boolean, serverId: string) {
  const [gpus, setGpus] = useState<Gpu[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchGpus = async () => {
      setLoading(true);
      await axios.get(`/api/server/details?serverId=${serverId}`)
        .then(res => {
          if (!res.data.success) {
            console.error("Error fetching GPUs:", res.data.error);
            toast.error(res.data.error || "Error al obtener las GPUs disponibles");
          }
          setGpus(res.data.data.data.gpus ?? []);
        })
        .catch(error => {
          console.error("Error fetching GPUs:", error);
          toast.error("Error al obtener las GPUs disponibles");
          setGpus([]);
        })
        .finally(() => setLoading(false));
    };

    fetchGpus();
  }, [open, serverId]);

  return { gpus, loading };
}
