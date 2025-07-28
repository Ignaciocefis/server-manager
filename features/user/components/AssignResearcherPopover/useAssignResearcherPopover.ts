import { useEffect, useState } from "react";
import axios from "axios";
import { Researcher } from "@/lib/types/user";
import { toast } from "sonner";

export function useResearchers(open: boolean) {
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  
  useEffect(() => {
    if (!open) return;

    axios
      .get("/api/researcher/allResearchers")
      .then((res) => setResearchers(res.data.data || []))
      .catch(() => toast.error("Error al cargar investigadores"));
  }, [open]);

  return researchers;
}
