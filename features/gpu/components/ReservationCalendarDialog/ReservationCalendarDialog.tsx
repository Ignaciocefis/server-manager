"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import {
  CalendarDays,
  User,
  Cpu,
  Server,
  BadgeCheck,
  Clock,
  Timer,
} from "lucide-react";
import { CalendarEvent } from "../ReservationCalendar/ReservationCalendar.types";
import { RESERVATION_STATUS_ES } from "../ReservationCalendar/ReservationCalendar.utils";

interface ReservationDialogProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

export function ReservationDialog({ event, onClose }: ReservationDialogProps) {
  return (
    <Dialog open={!!event} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl shadow-xl">
        {event && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <CalendarDays className="text-blue-app" />
                Detalles de la reserva
              </DialogTitle>
              <DialogDescription>
                Información sobre la GPU y el servidor reservado
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="text-gray-app-500 w-4 h-4" />
                <span>
                  <strong>Usuario:</strong> {event.resource.userName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Cpu className="text-green-app w-4 h-4" />
                <span>
                  <strong>GPU:</strong> {event.resource.gpuName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Server className="text-purple-app w-4 h-4" />
                <span>
                  <strong>Servidor:</strong> {event.resource.serverName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <BadgeCheck className="text-yellow-500 w-4 h-4" />
                <span>
                  <strong>Estado:</strong>{" "}
                  {RESERVATION_STATUS_ES[event.resource.status]}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="text-blue-app w-4 h-4" />
                <span>
                  <strong>Inicio:</strong>{" "}
                  {event.resource.startDate.toLocaleString("es-ES", {
                    timeZone: "Europe/Madrid",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Timer className="text-red-app w-4 h-4" />
                <span>
                  <strong>Fin:</strong>{" "}
                  {event.resource.endDate.toLocaleString("es-ES", {
                    timeZone: "Europe/Madrid",
                  })}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={onClose}
                className="bg-gray-800 text-white hover:bg-gray-700"
              >
                Cerrar
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
