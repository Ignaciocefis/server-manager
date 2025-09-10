export interface GpuReservationListProps {
  id: string;
  createdAt: string;
  gpuId: string;
  serverId: string;
  status: "PENDING" | "ACTIVE" | "EXTENDED";
  startDate: string | null;
  endDate: string | null;
  actualendDate: string | null;
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
};