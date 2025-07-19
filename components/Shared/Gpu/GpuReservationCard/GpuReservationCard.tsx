import { useEffect, useMemo, useState } from "react";
import { isAfter } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GpuReservationCardProps } from "./GpuReservationCard.types";
import { HardDrive, MemoryStick, Microchip, MinusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import GpuExtendButton from "@/app/(home)/components/Gpu/gpuReservationExtend/gpuReservationExtend";

function formatCountdown(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function GpuReservationCard({
  reservationId,
  status,
  startTime,
  endTime,
  extendedAt,
  extendedUntil,
  gpu,
  server,
  onRefresh,
}: GpuReservationCardProps) {
  const start = useMemo(
    () => (startTime ? new Date(startTime) : null),
    [startTime]
  );
  const end = useMemo(() => (endTime ? new Date(endTime) : null), [endTime]);
  const extended = useMemo(
    () => (extendedAt ? new Date(extendedAt) : null),
    [extendedAt]
  );
  const extendedUntilDate = useMemo(
    () => (extendedUntil ? new Date(extendedUntil) : null),
    [extendedUntil]
  );

  const [cancelling, setCancelling] = useState(false);

  const finalEnd = useMemo(() => {
    if (status === "EXTENDED" && extendedUntilDate) {
      return extendedUntilDate;
    }
    if (extended && end) {
      return isAfter(extended, end) ? extended : end;
    }
    return end;
  }, [status, extendedUntilDate, extended, end]);

  const [countdown, setCountdown] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(updateCountdown, 1000);

    function updateCountdown() {
      const now = new Date();

      if (status === "PENDING" && start) {
        const diffSeconds = Math.max(
          0,
          Math.floor((start.getTime() - now.getTime()) / 1000)
        );
        if (diffSeconds === 0) {
          setCountdown("Comenzando...");
        } else {
          setCountdown(formatCountdown(diffSeconds));
        }
      } else if ((status === "ACTIVE" || status === "EXTENDED") && finalEnd) {
        const diffSeconds = Math.max(
          0,
          Math.floor((finalEnd.getTime() - now.getTime()) / 1000)
        );
        if (diffSeconds === 0) {
          setCountdown("Finalizado");
        } else {
          setCountdown(formatCountdown(diffSeconds));
        }
      } else {
        setCountdown(null);
      }
    }

    updateCountdown();

    return () => clearInterval(interval);
  }, [status, start, finalEnd]);

  const isPending = status === "PENDING";
  const isExtended = status === "EXTENDED";

  const handleCancelReservation = async () => {
    try {
      setCancelling(true);
      const res = await axios.put("/api/gpu/cancelation", {
        reservationId,
      });

      if (res.status === 200) {
        toast.success("Reserva cancelada exitosamente");
      } else {
        toast.error("Error al cancelar la reserva");
      }
      onRefresh?.();
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.error ??
            "Error inesperado al cancelar la reserva. Intenta nuevamente."
        );
      } else {
        toast.error(
          "Error inesperado al cancelar la reserva. Intenta nuevamente."
        );
      }
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Card className="bg-gray-app-500 text-gray-app-100 rounded-xl p-4 w-auto">
      <CardHeader className="flex w-full items-center">
        <CardTitle className="text-xl font-bold">{gpu.name}</CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="mb-4">
          <h3 className="font-semibold mb-2 text-sm">Detalles de la GPU:</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-app-100">
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
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-app-100">
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
              className={`w-full h-full flex flex-col items-center justify-center text-center py-2 ${
                isPending
                  ? "bg-gray-app-400 hover:bg-gray-app-600"
                  : "bg-green-app-500 hover:bg-green-app-500-transparent"
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
              currentEndTime={finalEnd ?? end}
              isExtended={isExtended}
              onSuccess={onRefresh ?? (() => {})}
            />
          )}
          <Button
            onClick={() => handleCancelReservation()}
            disabled={cancelling}
            className="w-full bg-red-app-500 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-red-300"
          >
            <MinusCircle size={16} className="inline mr-1" />
            {cancelling ? "Cancelando..." : "Cancelar uso"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
