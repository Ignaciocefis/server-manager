export interface GpuReservationCardProps {
  reservationId: string;
  status: "PENDING" | "ACTIVE" | "EXTENDED";
  startDate: string | null;
  endDate: string | null;
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

export interface UseRersevationIdCardProps {
  status: "PENDING" | "ACTIVE" | "EXTENDED";
  startDate: Date | null;
  endDate: Date | null;
  extendedAt?: Date | null;
  extendedUntil?: Date | null;
}