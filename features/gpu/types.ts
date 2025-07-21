export interface gpuSummary {
  id: string;
  name: string;
  type: string;
  ramGB: number;
}

export interface GpuSummaryWithReservations extends gpuSummary {
  reservations: {
    id: string;
    userId: string;
    status: "PENDING" | "ACTIVE" | "EXTENDED" | "COMPLETED" | "CANCELLED";
  }[];
}