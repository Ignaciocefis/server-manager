import { Gpu } from "@/features/gpu/types";


export type DateRange = { from: Date | undefined; to?: Date | undefined };


export interface GpuReservationFormProps {
  serverId: string;
  gpus: Gpu[];
  closeDialog: () => void;
  onSuccess: () => void;
}

export type RawGpuReservationFormData = {
  serverId: string;
  range: {
    from?: unknown;
    to?: unknown;
  };
  startHour: string;
  endHour: string;
  selectedGpuIds: string[];
};