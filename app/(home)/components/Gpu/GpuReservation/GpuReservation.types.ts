export type Reservation = {
  startTime: string;
  endTime: string;
};

export type Gpu = {
  id: string;
  name: string;
  reservations: Reservation[];
};

export type DateRange = { from: Date | undefined; to?: Date | undefined };


export interface GpuReservationFormProps {
  serverId: string;
  gpus: Gpu[];
  closeDialog: () => void;
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