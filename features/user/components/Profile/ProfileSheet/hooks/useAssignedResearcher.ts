import { useEffect, useState } from "react";
import axios from "axios";
import { handleApiError } from "@/lib/services/errors/errors";

export function useAssignedResearcher(category: string, assignedToId: string | null) {
  const [researcherName, setResearcherName] = useState<string | null>(null);

  useEffect(() => {
    const fetchResearcher = async () => {
      if (category === "JUNIOR" && assignedToId) {
        axios.get(`/api/researcher/findResearcher?id=${assignedToId}`)
          .then((res) => {
            const researcher = res.data.data;
            setResearcherName(researcher)
          }).catch((error) => {
            handleApiError(error, true);
          });
      } else {
        setResearcherName(null);
      }
    };

    fetchResearcher();
  }, [category, assignedToId]);

  return researcherName;
}
