export interface GpuReservationListProps {
  id: string;
  createdAt: Date | null;
  gpuId: string;
  serverId: string;
  status: "PENDING" | "ACTIVE" | "EXTENDED" | "COMPLETED" | "CANCELLED";
  startDate: Date | null;
  endDate: Date | null;
  actualEndDate: Date | null;
  extendedAt: Date | null;
  extendedUntil: Date | null;
  gpu: {
    name: string;
  };
  server: {
    name: string;
  };
  user: {
    name: string;
    firstSurname: string;
  };
};