import { useEffect, useState } from "react";
import axios from "axios";
import { GpuReservationListProps } from "./GpuReservationsList.types";
import { handleApiError } from "@/lib/services/errors/errors";

export function useReservations() {
  const [reservations, setReservations] = useState<GpuReservationListProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReservations = async () => {
    setLoading(true);
    setError("");

    await axios.get("/api/gpu/list")
      .then(res => {
        setReservations(res.data.data.data);
      })
      .catch(error => {
        const msg = handleApiError(error, false);
        setError(msg);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return {
    reservations,
    loading,
    error,
    refreshList: () => {
      fetchReservations();
    },
  };
}
