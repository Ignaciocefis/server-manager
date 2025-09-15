import { useEffect, useState } from "react";
import axios from "axios";
import { Researcher } from "@/lib/types/user";
import { handleApiError } from "@/lib/services/errors/errors";

export function useResearchers(open: boolean) {
  const [researchers, setResearchers] = useState<Researcher[]>([]);

  useEffect(() => {
    if (!open) return;

    axios
      .get("/api/user/researcher/allResearchers")
      .then((res) => {
        setResearchers(res.data.data || []);
      })
      .catch((error) => {
        handleApiError(error, true);
      });
  }, [open]);

  return researchers;
}
