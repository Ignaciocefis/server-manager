"use client";

import { Gpu, MemoryStick, Microchip } from "lucide-react";
import { GpuDetailsInfoProps } from "./GpuDetailsInfo.types";

export const GpuDetailsInfo: React.FC<GpuDetailsInfoProps> = ({
  id,
  type,
  name,
  ramGB,
}) => {
  return (
    <div key={id} className="bg-gray-app-500 p-3 rounded-lg shadow-md">
      <p>
        <Microchip size={12} className="inline mr-2" />
        <span className="font-semibold">Tipo:</span> {type}
      </p>
      <p>
        <Gpu size={12} className="inline mr-2" />
        <span className="font-semibold">Nombre:</span> {name}
      </p>
      <p>
        <MemoryStick size={12} className="inline mr-2" />
        <span className="font-semibold">RAM:</span> {ramGB} GB
      </p>
    </div>
  );
};
