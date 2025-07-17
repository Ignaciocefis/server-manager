"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import GpuReservationCard from "@/components/Shared/Gpu/GpuReservationCard/GpuReservationCard";
import { GpuReservationListProps } from "./GpuReservationsList.types";

export function GpuReservationsList() {
  const [reservations, setReservations] = useState<GpuReservationListProps[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get("/api/gpu/list");
        setReservations(response.data);
      } catch (error) {
        console.error("Error al cargar reservas:", error);
        setError("No se pudieron cargar las reservas.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [refresh]);

  const sortedReservations = [...reservations].sort((a, b) => {
    const getFinalEnd = (res: GpuReservationListProps) => {
      const end = res.endTime ? new Date(res.endTime) : new Date(0);
      const extended = res.extendedAt ? new Date(res.extendedAt) : null;
      return extended && extended > end ? extended : end;
    };

    const getPriority = (status: string) => {
      switch (status) {
        case "ACTIVE":
        case "EXTENDED":
          return 0;
        case "PENDING":
          return 1;
        default:
          return 2;
      }
    };

    const priorityDiff = getPriority(a.status) - getPriority(b.status);
    if (priorityDiff !== 0) return priorityDiff;

    return getFinalEnd(a).getTime() - getFinalEnd(b).getTime();
  });

  if (loading) return <p className="p-4">Cargando reservas...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="w-11/12 m-4 grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))] items-center place-items-center">
      {sortedReservations.length === 0 ? (
        <p className="col-span-full text-center">No tienes GPUs reservadas.</p>
      ) : (
        sortedReservations.map((r) => (
          <GpuReservationCard
            key={r.id}
            reservationId={r.id}
            gpu={r.gpu}
            server={r.server}
            status={r.status}
            startTime={r.startTime}
            endTime={r.endTime}
            extendedAt={r.extendedAt}
            onRefresh={() => setRefresh((prev) => !prev)}
          />
        ))
      )}
    </div>
  );
}
