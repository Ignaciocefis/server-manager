"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cpu, HardDrive, MemoryStick, MinusCircle, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { GpuReservationCardProps } from "./GpuReservationCard.types";
import { useGpuCountdown } from "./useGpuReservationCard";
import { handleCancelReservation } from "./GpuReservationCard.handlers";
import GpuExtendButton from "../GpuExtendButton/GpuExtendButton";
import { ConfirmDialog } from "@/components/Shared/ConfirmDialog/ConfirmDialog";
import { ConfirmMessageKey } from "@/components/Shared/ConfirmDialog/ConfirmDialog.types";
import { useLanguage } from "@/hooks/useLanguage";

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
  const { t } = useLanguage();

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
  const [showConfirm, setShowConfirm] = useState(false);

  const isPending = status === "PENDING";
  const isExtended = status === "EXTENDED";

  const handleConfirmCancel = async () => {
    setCancelling(true);
    await handleCancelReservation(reservationId, onRefresh);
    setCancelling(false);
    setShowConfirm(false);
  };

  return (
    <>
      <Card className="bg-white text-gray-900 rounded-2xl p-4 w-auto md:w-[380px] md:h-[290px] shadow-md border border-gray-200">
        <CardHeader>
          <div className="flex items-center gap-3 -ml-5">
            <Zap className="w-6 h-6 text-blue-app" />
            <CardTitle className="text-xl font-bold">{gpu.name}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="px-4 py-3">
          <div className="mb-5">
            <h3 className="font-semibold mb-3 text-sm text-gray-800 flex items-center gap-2">
              <Cpu size={16} className="text-blue-600" />
              {t("Gpu.reservationsList.gpuDetails")}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <MemoryStick size={16} className="text-gray-500" />
                <span className="font-medium">RAM:</span>
                <span className="text-gray-600">{gpu.ramGB} GB</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Cpu size={16} className="text-gray-500" />
                <span className="font-medium">
                  {t("Gpu.reservationsList.gpuType")}:
                </span>
                <span className="text-gray-600">{gpu.type}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 my-4"></div>

          <div>
            <h3 className="font-semibold mb-3 text-sm text-gray-800 flex items-center gap-2">
              <HardDrive size={16} className="text-blue-600" />
              {t("Gpu.reservationsList.serverDetails")}{" "}
              <span className="text-gray-600 font-normal">{server.name}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <MemoryStick size={16} className="text-gray-500" />
                <span className="font-medium">RAM:</span>
                <span className="text-gray-600">{server.ramGB} GB</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <HardDrive size={16} className="text-gray-500" />
                <span className="font-medium">
                  {t("Gpu.reservationsList.disks")}:
                </span>
                <span className="text-gray-600">{server.diskCount}</span>
              </div>
            </div>
          </div>
        </CardContent>

        <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex justify-center items-center w-full sm:w-auto">
            {countdown && (
              <Button
                className={`flex flex-col items-center justify-center text-center px-4 py-2 min-h-[3.5rem] whitespace-nowrap
              ${
                isPending
                  ? "bg-gray-app-100 hover:bg-gray-app-100 text-gray-app-600 font-bold shadow-md cursor-not-allowed w-40"
                  : "bg-green-app-100 text-gray-app-600 font-bold hover:bg-green-app shadow-md w-40"
              }`}
              >
                <span className="text-sm font-semibold tracking-wide -mb-2">
                  {isPending
                    ? t("Gpu.reservationsList.pending")
                    : isExtended
                      ? t("Gpu.reservationsList.extended")
                      : t("Gpu.reservationsList.reserved")}
                </span>
                <span className="text-xl">{countdown}</span>
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
              onClick={() => setShowConfirm(true)}
              disabled={cancelling}
              className="bg-red-app-100 text-gray-app-600 font-bold hover:bg-red-app shadow-md cursor-pointer w-40"
            >
              <MinusCircle size={16} className="inline mr-1" />
              {cancelling
                ? t("Gpu.reservationsList.canceling")
                : t("Gpu.reservationsList.cancelUsage")}
            </Button>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmCancel}
        messageKey={"cancel_reservation" as ConfirmMessageKey}
        params={{
          gpu: gpu.name,
          server: server.name,
          date: end?.toLocaleString() ?? "",
        }}
      />
    </>
  );
}
