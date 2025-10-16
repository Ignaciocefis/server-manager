"use client";

import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { TYPE_VARIANTS } from "../../helpers";
import { getTypeIcon } from "../../utils";

interface TypeBadgeProps {
  type: string;
}

export const TypeBadge = ({ type }: TypeBadgeProps) => {
  const { t } = useLanguage();

  const variant = TYPE_VARIANTS[type] ?? "info";
  const color = {
    error: "bg-red-app-transparent",
    warning: "bg-yellow-app-transparent",
    success: "bg-green-app-transparent",
    info: "bg-blue-app-transparent",
  }[variant];

  const label = t(`EventLog.logType.${type.toLowerCase()}`);

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
