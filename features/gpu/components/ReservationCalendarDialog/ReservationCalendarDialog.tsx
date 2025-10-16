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
import {
  RESERVATION_STATUS_EN,
  RESERVATION_STATUS_ES,
} from "../ReservationCalendar/ReservationCalendar.utils";
import { useLanguage } from "@/hooks/useLanguage";

interface ReservationDialogProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

export function ReservationDialog({ event, onClose }: ReservationDialogProps) {
  const { t, language } = useLanguage();

  return (
    <Dialog open={!!event} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl shadow-xl">
        {event && (
          <>
            <DialogHeader className="mb-4">
              <div className="flex items-center gap-4">
                <CalendarDays className="w-8 h-8 text-blue-app" />
                <DialogTitle className="text-2xl font-bold">
                  {t("Gpu.calendar.reservationDetailsTitle")}
                </DialogTitle>
              </div>
              <DialogDescription className="md:ml-12 -ml-4">
                {t("Gpu.calendar.reservationDetailsDescription")}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 ml-8 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <User size={16} className="text-gray-500" />
                <span className="font-medium">{t("Gpu.calendar.user")}</span>
                <span className="text-gray-600">{event.resource.userName}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-700">
                <Cpu size={16} className="text-gray-500" />
                <span className="font-medium">{t("Gpu.calendar.gpu")}</span>
                <span className="text-gray-600">{event.resource.gpuName}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-700">
                <Server size={16} className="text-gray-500" />
                <span className="font-medium">{t("Gpu.calendar.server")}</span>
                <span className="text-gray-600">
                  {event.resource.serverName}
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-700">
                <BadgeCheck size={16} className="text-gray-500" />
                <span className="font-medium">{t("Gpu.calendar.status")}</span>
                <span className="text-gray-600">
                  {language === "es"
                    ? RESERVATION_STATUS_ES[event.resource.status]
                    : RESERVATION_STATUS_EN[event.resource.status]}
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-700">
                <Clock size={16} className="text-gray-500" />
                <span className="font-medium">{t("Gpu.calendar.start")}</span>
                <span className="text-gray-600">
                  {event.resource.startDate.toLocaleString("es-ES", {
                    timeZone: "Europe/Madrid",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-700">
                <Timer size={16} className="text-gray-500" />
                <span className="font-medium">{t("Gpu.calendar.end")}</span>
                <span className="text-gray-600">
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
                {t("Gpu.calendar.close")}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
