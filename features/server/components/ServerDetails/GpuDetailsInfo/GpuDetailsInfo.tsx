"use client";

import { Cpu, Gpu, MemoryStick } from "lucide-react";
import { GpuDetailsInfoProps } from "./GpuDetailsInfo.types";
import { useLanguage } from "@/hooks/useLanguage";

export const GpuDetailsInfo: React.FC<GpuDetailsInfoProps> = ({
  id,
  type,
  name,
  ramGB,
}) => {
  const { t } = useLanguage();

  return (
    <div
      key={id}
      className="p-3 rounded-lg border border-gray-app-200 shadow-sm bg-white"
    >
      <div className="flex items-center gap-2 mb-3">
        <Gpu size={16} className="text-blue-app" />
        <span className="text-xl font-bold">{name}</span>
      </div>
      <div className="flex items-center gap-2">
        <Cpu size={16} className="text-gray-500" />
        <span className="font-medium">{t("Server.details.type")}</span>
        <span>{type}</span>
      </div>
      <div className="flex items-center gap-2">
        <MemoryStick size={16} className="text-gray-500" />
        <span className="font-medium">RAM: </span>
        <span>{ramGB} GB</span>
      </div>
    </div>
  );
};
