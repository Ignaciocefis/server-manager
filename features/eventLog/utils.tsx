import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { TYPE_VARIANTS } from "./helpers";
import { LogsTableDataProps } from "./types";

export function getNestedValue(obj: unknown, path: string): unknown {
  if (obj == null || typeof obj !== "object" || !path) return undefined;
  const parts = path.split(".");
  let current: unknown = obj;
  for (const key of parts) {
    if (current == null || typeof current !== "object") return undefined;
    if (!Object.prototype.hasOwnProperty.call(current, key)) return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

export function toDisplay(value: unknown): string {
  if (value == null) return "";
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "name" in (value as Record<string, unknown>) &&
    typeof (value as Record<string, unknown>).name === "string"
  ) {
    return (value as Record<string, unknown>).name as string;
  }
  return "";
}

export const getTypeIcon = (type: string) => {
  const variant = TYPE_VARIANTS[type];

  switch (variant) {
    case "error":
      return <XCircle className="w-4 h-4" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4" />;
    case "success":
      return <CheckCircle className="w-4 h-4" />;
    case "info":
      return <Info className="w-4 h-4" />;
    default:
      return <Info className="w-4 h-4" />;
  }
};

export const exportLogsToCSV = (logs: LogsTableDataProps[]) => {
  if (!logs || logs.length === 0) return;

  const csvRows: string[] = [];
  const headers = Object.keys(logs[0]);
  csvRows.push(headers.join(","));

  for (const log of logs) {
    const values = headers.map((header) => {
      const value = getNestedValue(log, header);
      const displayValue = toDisplay(value).replace(/"/g, '""');
      return `"${displayValue}"`;
    });
    csvRows.push(values.join(","));
  }

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "logs.csv";
  a.click();
  URL.revokeObjectURL(url);
};
