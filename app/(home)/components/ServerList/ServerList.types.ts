export interface ServerListItem {
  id: string;
  name: string;
  ramGB: number;
  diskCount: number;
  available: boolean;
  tarjetasInstaladas?: number;
  tarjetasDisponibles?: number;
}
