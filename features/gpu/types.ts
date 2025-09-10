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
  startDate: string;
  endDate: string;
};

export type Gpu = {
  id: string;
  name: string;
  reservations: Reservation[];
};

export interface gpuName {
  id: string;
  name: string;
}

export interface reservationForCalendarWithoutFormat {
  id: string;
  user: {
    name: string;
    firstSurname: string;
  };
  gpu: {
    name: string;
  };
  server: {
    name: string;
  };
  startDate: Date;
  endDate: Date;
  actualEndDate: Date | null;
  status: "PENDING" | "ACTIVE" | "EXTENDED" | "COMPLETED" | "CANCELLED";
}

export interface reservationForCalendar {
  id: string;
  userName: string;
  gpuName: string;
  serverName: string;
  startDate: Date;
  endDate: Date;
  status: "PENDING" | "ACTIVE" | "EXTENDED" | "COMPLETED" | "CANCELLED";
}