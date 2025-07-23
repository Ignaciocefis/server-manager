import { Gpu } from "@/features/gpu/types";

export interface GpuReservationProps {
  name: string;
  availableGpus: Gpu[];
}