import { useEffect, useState } from "react";
import axios from "axios";
import { handleApiError } from "@/lib/services/errors/errors";

export function useAssignedResearcher(category: string, assignedToId: string | null) {
  const [researcherName, setResearcherName] = useState<string | null>(null);

  useEffect(() => {
    const fetchResearcher = async () => {
      if (category === "JUNIOR" && assignedToId) {
        axios.get(`/api/user/researcher/findResearcher?id=${assignedToId}`)
          .then((res) => {
            const researcherName = res.data.data.name + " " + res.data.data.firstSurname;
            setResearcherName(researcherName ?? null);
          })
          .catch((error) => {
            handleApiError(error, true);
          });
      } else {
        setResearcherName(null);
      }
    };

    fetchResearcher();
  }, [category, assignedToId]);

  console.log("Assigned Researcher:", researcherName);

  return researcherName;
}
