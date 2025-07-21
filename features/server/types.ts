import { gpuSummary } from "../gpu/types";

export interface ServerSummary {
  id: string;
  name: string;
  ramGB: number;
  diskCount: number;
  available: boolean;
  installedGpus: number;
  availableGpus: number;
  gpus: gpuSummary[];
}

export interface ServerSummaryWithReservations extends ServerSummary {
  reservations: Array<{
    id: string;
    userId: string;
    status: "ACTIVE" | "EXTENDED";
    gpu: {
      id: string;
      name: string;
    };
    user: {
      name: string;
      firstSurname: string;
      secondSurname: string | null;
    };
  }>;
}
