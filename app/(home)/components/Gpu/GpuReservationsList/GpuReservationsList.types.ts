export interface GpuReservationListProps {
  id: string;
  createdAt: string;
  gpuId: string;
  serverId: string;
  status: "PENDING" | "ACTIVE" | "EXTENDED";
  startTime: string | null;
  endTime: string | null;
  actualEndTime: string | null;
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
};