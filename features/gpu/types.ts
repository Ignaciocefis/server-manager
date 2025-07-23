export interface gpuSummary {
  id: string;
  name: string;
  type: string;
  ramGB: number;
}

export interface reservationSummary {
  id: string;
  userId: string;
  gpuId: string;
  serverId: string;
  startDate: Date;
  endDate: Date;
  actualEndDate: Date;
  status: "PENDING" | "ACTIVE" | "EXTENDED" | "COMPLETED" | "CANCELLED";
}

export interface GpuSummaryWithReservations extends gpuSummary {
  reservations: {
    id: string;
    userId: string;
    status: "PENDING" | "ACTIVE" | "EXTENDED" | "COMPLETED" | "CANCELLED";
  }[];
}

export interface reservationSummaryWithServerAndGpu extends reservationSummary {
  server: {
    id: string;
    name: string;
    ramGB: number;
    diskCount: number;
  };
  gpu: {
    id: string;
    name: string;
    type: string;
    ramGB: number;
  };
}

export interface reservationSummaryWithExtendedUntil extends reservationSummary {
  extendedUntil?: Date;
}

export type Reservation = {
  startTime: string;
  endTime: string;
};

export type Gpu = {
  id: string;
  name: string;
  reservations: Reservation[];
};