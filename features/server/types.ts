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
    userId: string | null;
  }[];
  reservations?: {
    id: string;
    startDate: string;
    endDate: string | null;
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

export interface ServerName {
  id: string;
  name: string;
}

export interface AccessToServerWithEmailAndGpus {
  email: string;
  gpus: string[];
}