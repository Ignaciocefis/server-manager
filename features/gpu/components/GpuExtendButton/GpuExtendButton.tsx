"use client";

import { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CircleMinus, CirclePlus } from "lucide-react";
import { handleExtendReservation } from "./GpuExtendButton.handlers";
import { GpuExtendButtonProps } from "./GpuExtendButton.types";
import { ConfirmDialog } from "@/components/Shared";
import { useLanguage } from "@/hooks/useLanguage";

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
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { t } = useLanguage();

  const openConfirmDialog = () => {
    setConfirmOpen(true);
  };

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
    setConfirmOpen(false);
  };

  return (
    <>
      <Popover open={showPopover} onOpenChange={setShowPopover}>
        <PopoverTrigger asChild>
          <Button
            disabled={isExtended}
            className={`w-full text-gray-app-600 font-bold shadow-md ${
              isExtended
                ? "bg-gray-app-100 cursor-not-allowed"
                : "bg-yellow-app-100 hover:bg-yellow-app cursor-pointer"
            }`}
          >
            <CirclePlus size={16} className="inline mr-1" />
            {t("Gpu.reservationsList.extend")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <p className="text-sm mb-2">
            {t("Gpu.reservationsList.extendForHours")}
          </p>
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
                <CircleMinus className="w-10 h-full text-red-700" />
              </div>

              <div className="flex flex-col justify-center">
                <h3 className="text-lg md:text-2xl font-bold text-red-700">
                  {t("Gpu.reservationsList.errorExtending")}
                </h3>
                <p className="text-sm md:text-base text-red-app">{error}</p>
              </div>
            </div>
          )}

          <div className="flex gap-2 w-full">
            <Button
              onClick={openConfirmDialog}
              disabled={loading}
              className="flex-1 bg-green-app hover:bg-green-app-transparent"
            >
              <CirclePlus size={16} className="inline mr-1" />
              {loading
                ? t("Gpu.reservationsList.extending")
                : t("Gpu.reservationsList.confirm")}
            </Button>
            <Button
              onClick={() => setShowPopover(false)}
              className="flex-1 bg-red-app hover:bg-red-app-transparent"
            >
              <CircleMinus size={16} className="inline mr-1" />
              {t("Gpu.reservationsList.cancel")}
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={onConfirmExtend}
        messageKey="extend_reservation"
        params={{
          hours: hoursToExtend,
        }}
      />
    </>
  );
}
