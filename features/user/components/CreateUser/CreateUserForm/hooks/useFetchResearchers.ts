import { useEffect, useState } from "react";
import axios from "axios";
import type { UseFetchResearchersResult } from "../CreateUserForm.types";
import { Researcher } from "@/lib/types/user";
import { handleApiError } from "@/lib/services/errors/errors";

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
        setResearchers(res.data.data || []);
      })
      .catch((error) => {
        const msg = handleApiError(error, true);
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [category]);

  return { researchers, loading, error };
}
