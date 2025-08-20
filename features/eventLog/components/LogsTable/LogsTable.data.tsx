import { LogsTableColumn } from "./LogsTable.types";

export const INITIAL_COLUMNS: LogsTableColumn[] = [
  { key: "createdAt", label: "Fecha y Hora", visible: true },
  { key: "userFullName", label: "Usuario", visible: true },
  { key: "server.name", label: "Servidor", visible: true },
  { key: "reservation.gpu.name", label: "GPU", visible: true },
  { key: "eventType", label: "Tipo", visible: true },
  { key: "message", label: "Mensaje", visible: true },
];
