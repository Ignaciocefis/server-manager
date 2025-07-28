import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export function useAssignedResearcher(category: string, assignedToId: string | null) {
  const [researcherName, setResearcherName] = useState<string | null>(null);

  useEffect(() => {
    const fetchResearcher = async () => {
      if (category === "JUNIOR" && assignedToId) {
        axios.get(`/api/researcher/findResearcher?id=${assignedToId}`)
          .then((res) => {
            if (!res.data.success) {
              toast.error(res.data.error || "Error al actualizar el perfil");
              return;
            }

            const researcher = res.data.data;
            setResearcherName(researcher)
          }).catch((error) => {
            console.error("Error al obtener el investigador:", error);
            toast.error("Error al obtener el investigador");
          });
      } else {
        setResearcherName(null);
      }
    };

    fetchResearcher();
  }, [category, assignedToId]);

  return researcherName;
}
