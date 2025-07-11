export interface ServerListItem {
  id: string;
  name: string;
  ramGB: number;
  diskCount: number;
  available: boolean;
  installedGpus?: number;
  availableGpus?: number;
}
