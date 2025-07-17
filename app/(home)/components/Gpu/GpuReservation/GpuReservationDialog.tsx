"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import axios from "axios";
import { GpuReservationForm } from "./GpuReservationForm";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Gpu } from "./GpuReservation.types";

export function GpuReservationDialog({
  serverId,
  onSuccess,
}: {
  serverId: string;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [gpus, setGpus] = useState<Gpu[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `/api/server/details?serverId=${serverId}`
        );
        setGpus(response.data.gpus);
      } catch (error) {
        console.error("Error fetching server details:", error);
        setGpus([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open, serverId]);

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
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
