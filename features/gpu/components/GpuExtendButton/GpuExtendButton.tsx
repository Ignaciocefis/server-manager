"use client";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CircleMinus, CirclePlus, TriangleAlert } from "lucide-react";
import { handleExtendReservation } from "./GpuExtendButton.handlers";
import { useState } from "react";
import { GpuExtendButtonProps } from "./GpuExtendButton.types";

export default function GpuExtendButton({
  reservationId,
  currentendDate,
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
      currentendDate,
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

        {error && (
          <div className="border rounded-xl shadow-md p-5 bg-red-50 mt-4 flex items-stretch gap-4">
            <div className="flex-shrink-0 flex items-center">
              <TriangleAlert className="w-10 h-full text-red-700" />
            </div>

            <div className="flex flex-col justify-center">
              <h3 className="text-lg md:text-2xl font-bold text-red-700">
                Ha ocurrido un error
              </h3>
              <p className="text-sm md:text-base text-red-app">{error}</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 w-full">
          <Button
            onClick={onConfirmExtend}
            disabled={loading}
            className="flex-1 bg-green-app hover:bg-green-app-transparent"
          >
            <CirclePlus size={16} className="inline mr-1" />
            {loading ? "Extendiendo..." : "Confirmar"}
          </Button>
          <Button
            onClick={() => setShowPopover(false)}
            className="flex-1 bg-red-app hover:bg-red-app-transparent"
          >
            <CircleMinus size={16} className="inline mr-1" />
            Cancelar
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
