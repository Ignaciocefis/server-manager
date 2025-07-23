import { useEffect, useState } from "react";
import axios from "axios";
import { GpuReservationListProps } from "./GpuReservationsList.types";

export function useReservations() {
  const [reservations, setReservations] = useState<GpuReservationListProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      setError("");

      await axios.get("/api/gpu/list")
        .then(res => {
          if (!res.data.success) {
            console.error("Error al cargar reservas:", res.data.error);
            setError("No se pudieron cargar las reservas.");
            return;
          }

          setReservations(res.data);
        })
        .catch(error => {
          console.error("Error al cargar reservas:", error);
          setError("No se pudieron cargar las reservas.");
        })
        .finally(() => {
          setLoading(false);
        });
    };

    fetchReservations();
  }, [refresh]);

  return {
    reservations,
    loading,
    error,
    refreshList: () => setRefresh(prev => !prev),
  };
}
