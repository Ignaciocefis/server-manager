import { useEffect, useMemo, useState } from "react";
import { isAfter } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GpuReservationCardProps } from "./GpuReservationCard.types";
import {
  CirclePlus,
  HardDrive,
  MemoryStick,
  Microchip,
  MinusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function formatCountdown(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function GpuReservationCard({
  status,
  startTime,
  endTime,
  extendedAt,
  gpu,
  server,
}: GpuReservationCardProps) {
  const start = useMemo(
    () => (startTime ? new Date(startTime) : null),
    [startTime]
  );
  const end = endTime ? new Date(endTime) : null;
  const extended = extendedAt ? new Date(extendedAt) : null;

  const finalEnd =
    extended && end ? (isAfter(extended, end) ? extended : end) : end;

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
          <h3 className="font-semibold mb-2 text-sm">Detalles del servidor:</h3>
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
          {!isPending && (
            <Button
              className={`w-full text-gray-app-100 ${
                isExtended
                  ? "bg-gray-app-400 hover:bg-gray-app-600"
                  : "bg-yellow-500 hover:bg-yellow-600"
              }`}
            >
              <CirclePlus size={16} className="inline mr-1" />
              Prórroga
            </Button>
          )}
          <Button className="w-full bg-red-app-500 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-red-300">
            <MinusCircle size={16} className="inline mr-1" />
            Cancelar uso
          </Button>
        </div>
      </div>
    </Card>
  );
}
