"use client";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CircleMinus, CirclePlus } from "lucide-react";
import { handleExtendReservation } from "./GpuExtendButton.handlers";
import { GpuExtendButtonProps } from "./gpuExtendButton.types";
import { useState } from "react";

export default function GpuExtendButton({
  reservationId,
  currentEndTime,
  isExtended,
  onSuccess,
}: GpuExtendButtonProps) {
  const [showPopover, setShowPopover] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoursToExtend, setHoursToExtend] = useState<number>(1);

  const onConfirmExtend = () => {
    handleExtendReservation(
      reservationId,
      currentEndTime,
      hoursToExtend,
      onSuccess,
      setLoading,
      setError,
      setShowPopover
    );
  };

  return (
    <Popover open={showPopover} onOpenChange={setShowPopover}>
      <PopoverTrigger asChild>
        <Button
          disabled={isExtended}
          className={`w-full text-gray-app-100 ${
            isExtended
              ? "bg-gray-app-400 hover:bg-gray-app-600"
              : "bg-yellow-500 hover:bg-yellow-600"
          }`}
        >
          <CirclePlus size={16} className="inline mr-1" />
          Prórroga
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <p className="text-sm mb-2">¿Cuántas horas quieres extender? (1-12)</p>
        <input
          type="number"
          min={1}
          max={12}
          step={1}
          value={hoursToExtend}
          onChange={(e) => setHoursToExtend(Number(e.target.value))}
          className="w-full border rounded px-2 py-1 text-sm mb-2"
        />
        {error && <p className="text-sm text-red-500 mb-2">{error}</p>}
        <div className="flex gap-2 w-full">
          <Button
            onClick={onConfirmExtend}
            disabled={loading}
            className="flex-1 bg-green-app-500 hover:bg-green-app-500-transparent"
          >
            <CirclePlus size={16} className="inline mr-1" />
            {loading ? "Extendiendo..." : "Confirmar"}
          </Button>
          <Button
            onClick={() => setShowPopover(false)}
            className="flex-1 bg-red-app-500 hover:bg-red-app-500-transparent"
          >
            <CircleMinus size={16} className="inline mr-1" />
            Cancelar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
