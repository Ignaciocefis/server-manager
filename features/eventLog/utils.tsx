import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { TYPE_TRANSLATIONS, TYPE_VARIANTS } from "./helpers";
import { Badge } from "@/components/ui/badge";

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

export const getTypeBadge = (type: string) => {
  const variant = TYPE_VARIANTS[type] ?? "info";
  const label = TYPE_TRANSLATIONS[type] ?? type.replace(/_/g, " ");

  const color = {
    error: "bg-red-app-transparent",
    warning: "bg-yellow-app-transparent",
    success: "bg-green-app-transparent",
    info: "bg-blue-app-transparent",
  }[variant];

  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg font-medium ${color} gap-2`}
    >
      {getTypeIcon(type)}
      <span>{label}</span>
    </Badge>
  );
};
