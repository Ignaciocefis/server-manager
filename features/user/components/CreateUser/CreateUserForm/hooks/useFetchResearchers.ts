import { useEffect, useState } from "react";
import axios from "axios";
import type { UseFetchResearchersResult } from "../CreateUserForm.types";
import { Researcher } from "@/lib/types/user";
import { toast } from "sonner";

export function useFetchResearchers(category: string): UseFetchResearchersResult {
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category !== "JUNIOR") return;

    setLoading(true);
    setError(null);

    axios
      .get("/api/user/researcher/allResearchers")
      .then((res) => {
        if (!res.data.success) {
          setError(res.data.error || "Error al cargar investigadores");
          toast.error(res.data.error || "Error al cargar investigadores");
          return;
        }
        setResearchers(res.data.data || []);
      })
      .catch(() => setError("No se pudieron cargar los investigadores"))
      .finally(() => setLoading(false));
  }, [category]);

  return { researchers, loading, error };
}
