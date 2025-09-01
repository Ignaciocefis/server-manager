"use client";

import GpuReservationCard from "@/features/gpu/components/GpuReservationCard/GpuReservationCard";
import { useReservations } from "./useGpuReservationList";
import { sortReservations } from "../../utils";
import { JSX } from "react";

export function GpuReservationsList({
  refresh,
  gpuSearchTerm,
}: {
  refresh: () => void;
  gpuSearchTerm: string;
}): JSX.Element {
  const { reservations, loading, error } = useReservations();

  const sortedReservations = sortReservations(reservations);

  const filteredReservations = sortedReservations.filter(
    (r) =>
      r.gpu.name.toLowerCase().includes(gpuSearchTerm.toLowerCase()) ||
      r.server.name.toLowerCase().includes(gpuSearchTerm.toLowerCase())
  );

  if (loading) return <p className="p-4">Cargando reservas...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))] items-center place-items-center">
      {sortedReservations.length === 0 ? (
        <p className="col-span-full text-center">No tienes GPUs reservadas.</p>
      ) : filteredReservations.length === 0 ? (
        <p className="col-span-full text-center">
          No se encontraron resultados para la búsqueda.
        </p>
      ) : (
        filteredReservations.map((r) => (
          <GpuReservationCard
            key={r.id}
            reservationId={r.id}
            gpu={r.gpu}
            server={r.server}
            status={r.status}
            startDate={r.startDate}
            endDate={r.endDate}
            extendedAt={r.extendedAt}
            extendedUntil={r.extendedUntil}
            onRefresh={() => {
              refresh();
            }}
          />
        ))
      )}
    </div>
  );
}
