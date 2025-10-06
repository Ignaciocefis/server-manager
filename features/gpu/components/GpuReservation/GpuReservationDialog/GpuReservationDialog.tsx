"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CirclePlus, Gpu, RefreshCw } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { GpuReservationForm } from "../..";
import { useState } from "react";
import { useAvailableGpus } from "./useGpuReservationDialog";
import { GpuReservationDialogProps } from "./GpuReservationDialog.types";
import { useLanguage } from "@/hooks/useLanguage";

export function GpuReservationDialog({
  serverId,
  onSuccess,
}: GpuReservationDialogProps) {
  const [open, setOpen] = useState(false);
  const { gpus, loading } = useAvailableGpus(open, serverId);

  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full max-w-xs bg-green-app hover:bg-green-app-transparent">
          <CirclePlus />
          {t("Gpu.createReservation.requestButton")}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-4">
            <Gpu className="w-8 h-8 text-blue-app" />
            <DialogTitle className="text-2xl font-bold">
              {t("Gpu.createReservation.title")}
            </DialogTitle>
          </div>
          <DialogDescription className="md:ml-12 -ml-7">
            {t("Gpu.createReservation.description")}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="flex items-center justify-center gap-2 p-4 text-gray-700 text-sm font-medium">
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
            {t("Gpu.createReservation.loading")}
          </p>
        ) : (
          <GpuReservationForm
            gpus={gpus}
            serverId={serverId}
            closeDialog={() => setOpen(false)}
            onSuccess={onSuccess ?? (() => {})}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
