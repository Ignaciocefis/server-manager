import { Gpu } from "@/app/(home)/components/Gpu/GpuReservation/GpuReservation.types";

export interface GpuReservationProps {
  name: string;
  availableGpus: Gpu[];
}