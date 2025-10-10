import { LogsTableColumn } from "./LogsTable.types";

export const INITIAL_COLUMNS: LogsTableColumn[] = [
  { key: "createdAt", label: "EventLog.logsTable.createdAt", visible: true },
  {
    key: "userFullName",
    label: "EventLog.logsTable.userFullName",
    visible: true,
  },
  { key: "server.name", label: "EventLog.logsTable.serverName", visible: true },
  {
    key: "reservation.gpu.name",
    label: "EventLog.logsTable.gpuName",
    visible: true,
  },
  { key: "eventType", label: "EventLog.logsTable.eventType", visible: true },
  { key: "message", label: "EventLog.logsTable.message", visible: true },
];
