"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HardDrive, MemoryStick, Microchip, MinusCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { GpuReservationCardProps } from "./GpuReservationCard.types";
import { useGpuCountdown } from "./useGpuReservationCard";
import { handleCancelReservation } from "./GpuReservationCard.handlers";
import GpuExtendButton from "../GpuExtendButton/GpuExtendButton";

export default function GpuReservationCard({
  reservationId,
  status,
  startDate,
  endDate,
  extendedAt,
  extendedUntil,
  gpu,
  server,
  onRefresh,
}: GpuReservationCardProps) {
  const start = useMemo(
    () => (startDate ? new Date(startDate) : null),
    [startDate]
  );
  const end = useMemo(() => (endDate ? new Date(endDate) : null), [endDate]);
  const extended = useMemo(
    () => (extendedAt ? new Date(extendedAt) : null),
    [extendedAt]
  );
  const extendedUntilDate = useMemo(
    () => (extendedUntil ? new Date(extendedUntil) : null),
    [extendedUntil]
  );

  const { countdown, finalEnd } = useGpuCountdown({
    status,
    startDate: start,
    endDate: end,
    extendedAt: extended,
    extendedUntil: extendedUntilDate,
  });

  const [cancelling, setCancelling] = useState(false);
  const isPending = status === "PENDING";
  const isExtended = status === "EXTENDED";

  const handleCancel = async () => {
    setCancelling(true);
    await handleCancelReservation(reservationId, onRefresh);
    setCancelling(false);
  };

  return (
    <Card className="bg-gray-app-500 text-gray-app-100 rounded-xl p-4 w-auto">
      <CardHeader className="flex w-full items-center">
        <CardTitle className="text-xl font-bold">{gpu.name}</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="mb-4">
          <h3 className="font-semibold mb-2 text-sm">Detalles de la GPU:</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <div className="flex items-center gap-1">
              <MemoryStick size={16} />
              <span>RAM: {gpu.ramGB} GB</span>
            </div>
            <div className="flex items-center gap-1">
              <Microchip size={16} />
              <span>Tipo: {gpu.type}</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold mb-2 text-sm">
            Detalles del servidor {server.name}:
          </h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <div className="flex items-center gap-1">
              <MemoryStick size={16} />
              <span>RAM: {server.ramGB} GB</span>
            </div>
            <div className="flex items-center gap-1">
              <HardDrive size={16} />
              <span>Discos: {server.diskCount}</span>
            </div>
          </div>
        </div>
      </CardContent>

      <div className="border-t border-gray-700 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex justify-center items-center w-full sm:w-auto">
          {countdown && (
            <Button
              className={`w-full flex flex-col items-center justify-center text-center py-2 ${
                isPending
                  ? "bg-gray-app-400 hover:bg-gray-app-600"
                  : "bg-green-app hover:bg-green-app-transparent"
              }`}
            >
              <span className="text-sm font-semibold tracking-wide">
                {isPending
                  ? "Esperando..."
                  : isExtended
                    ? "En prórroga"
                    : "Reservado"}
              </span>
              <span className="text-xs opacity-80 mt-0.5">{countdown}</span>
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full max-w-xs sm:w-auto">
          {!isPending && end && (
            <GpuExtendButton
              reservationId={reservationId}
              currentendDate={finalEnd ?? end}
              isExtended={isExtended}
              onSuccess={onRefresh ?? (() => {})}
            />
          )}
          <Button
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full bg-red-app hover:brightness-110 focus-visible:ring-2 focus-visible:ring-red-300"
          >
            <MinusCircle size={16} className="inline mr-1" />
            {cancelling ? "Cancelando..." : "Cancelar uso"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
