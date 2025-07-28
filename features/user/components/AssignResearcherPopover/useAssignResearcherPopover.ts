import { useEffect, useState } from "react";
import axios from "axios";
import { Researcher } from "@/lib/types/user";
import { toast } from "sonner";

export function useResearchers(open: boolean) {
  const [researchers, setResearchers] = useState<Researcher[]>([]);

  useEffect(() => {
    if (!open) return;

    axios
      .get("/api/user/researcher/allResearchers")
      .then((res) => {
        if (!res.data.success) {
          toast.error(res.data.error || "Error al cargar investigadores");
          return;
        }
        setResearchers(res.data.data || []);
      })
      .catch((error) => {
        console.error("Error al cargar investigadores: ", error);
        toast.error(error.response?.data.error || "Error al cargar investigadores");
      });
  }, [open]);

  return researchers;
}
