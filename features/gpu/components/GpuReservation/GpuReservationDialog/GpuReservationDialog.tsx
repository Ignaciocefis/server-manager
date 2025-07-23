"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { GpuReservationForm } from "../..";
import { useState } from "react";
import { useAvailableGpus } from "./useGpuReservationDialog";
import { GpuReservationDialogProps } from "./GpuReservationDialog.types";

export function GpuReservationDialog({
  serverId,
  onSuccess,
}: GpuReservationDialogProps) {
  const [open, setOpen] = useState(false);
  const { gpus, loading } = useAvailableGpus(open, serverId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full max-w-xs bg-green-app-500 hover:bg-green-app-500-transparent">
          <CirclePlus />
          Solicitar uso de GPUs
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-6">
            <CirclePlus className="w-6 h-6" />
            <span className="text-2xl font-semibold text-right">
              Reservar GPUs
            </span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="p-4 text-center">Cargando GPUs...</p>
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
