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
}
