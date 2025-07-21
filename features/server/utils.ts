import { GpuSummaryWithReservations } from "../gpu/types";

export function getGpuAvailabilityStats(gpus: GpuSummaryWithReservations[]) {
  const installedGpus = gpus.length;

  const availableGpus = gpus.filter((gpu) =>
    gpu.reservations.every(
      (r) => r.status !== "ACTIVE" && r.status !== "EXTENDED"
    )
  ).length;

  return { installedGpus, availableGpus };
}