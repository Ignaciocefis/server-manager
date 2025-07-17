export interface ServerListItem {
  id: string;
  name: string;
  ramGB: number;
  diskCount: number;
  available: boolean;
  installedGpus?: number;
  availableGpus?: number;
  gpus?: {
    id: string;
    type: string;
    name: string;
    ramGB: number;
    status: "AVAILABLE" | "IN_USE";
    userId: string | null;
  }[];
  reservations?: {
    id: string;
    startTime: string;
    endTime: string | null;
    extendedUntil: string | null;
    status: "ACTIVE" | "EXTENDED" | string;
    gpuId: string | null;
    user: {
      name: string;
      firstSurname: string;
      secondSurname?: string | null;
    };
    gpu: {
      id: string;
      name: string;
    };
  }[];
}
