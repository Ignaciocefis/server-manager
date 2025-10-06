"use client";

import GpuReservationCard from "@/features/gpu/components/GpuReservationCard/GpuReservationCard";
import { useReservations } from "./useGpuReservationList";
import { sortReservations } from "../../utils";
import { JSX } from "react";
import { GpuReservationListSkeleton } from "./GpuReservationsList.skeleton";
import { TriangleAlert } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export function GpuReservationsList({
  refresh,
  gpuSearchTerm,
}: {
  refresh: () => void;
  gpuSearchTerm: string;
}): JSX.Element {
  const { reservations, loading, error } = useReservations();

  const { t } = useLanguage();

  const sortedReservations = sortReservations(reservations);

  const filteredReservations = sortedReservations.filter(
    (r) =>
      r.gpu.name.toLowerCase().includes(gpuSearchTerm.toLowerCase()) ||
      r.server.name.toLowerCase().includes(gpuSearchTerm.toLowerCase())
  );

  if (loading) return <GpuReservationListSkeleton />;
  if (error)
    return (
      <div className="border rounded-xl shadow-md p-5 bg-red-50 mt-4 flex items-stretch gap-4">
        <div className="flex-shrink-0 flex items-center">
          <TriangleAlert className="w-10 h-full text-red-700" />
        </div>

        <div className="flex flex-col justify-center">
          <h3 className="text-lg md:text-2xl font-bold text-red-700">
            {t("app.reservationsList.errorLoadingReservations")}
          </h3>
          <p className="text-sm md:text-base text-red-app">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]  md:grid-cols-[repeat(auto-fit,minmax(380px,1fr))] justify-items-center w-full mb-4">
      {sortedReservations.length === 0 ? (
        <p className="col-span-full text-center text-gray-600">
          {t("app.reservationsList.noGpuReservations")}
        </p>
      ) : filteredReservations.length === 0 ? (
        <p className="col-span-full text-center text-gray-600">
          {t("app.reservationsList.noSearchResults")}
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
