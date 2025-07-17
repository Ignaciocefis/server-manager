export interface GpuReservationCardProps {
  status: "PENDING" | "ACTIVE" | "EXTENDED";
  startTime: string | null;
  endTime: string | null;
  extendedAt: string | null;
  gpu: {
    name: string;
    type: string;
    ramGB: number;
  };
  server: {
    name: string;
    ramGB: number;
    diskCount: number;
  };
}