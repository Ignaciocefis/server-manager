export interface GpuReservationCardProps {
  reservationId: string;
  status: "PENDING" | "ACTIVE" | "EXTENDED";
  startTime: string | null;
  endTime: string | null;
  extendedAt: string | null;
  extendedUntil: string | null;
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
  onRefresh?: () => void;
}