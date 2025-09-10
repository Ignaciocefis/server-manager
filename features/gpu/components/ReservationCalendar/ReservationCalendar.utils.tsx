import { Button } from "@/components/ui/button";
import {
  ControlledToolbarProps,
  NavigateAction,
} from "./ReservationCalendar.types";
import { ArrowLeft, ArrowRight, Calendar1, CalendarDays } from "lucide-react";
import { reservationForCalendar } from "@/features/gpu/types";
import { handleReservationCalendar } from "./ReservationCalendar.handlers";

export const statusColors: Record<reservationForCalendar["status"], string> = {
  PENDING: "var(--color-blue-app-transparent)",
  ACTIVE: "var(--color-green-app-transparent)",
  EXTENDED: "var(--color-yellow-app-transparent)",
  COMPLETED: "var(--color-gray-app-300-transparent)",
  CANCELLED: "var(--color-red-app-transparent)",
};

export const CALENDAR_ES = {
  week: "Semana",
  work_week: "Semana laboral",
  day: "Día",
  month: "Mes",
  previous: "Atrás",
  next: "Siguiente",
  today: "Hoy",
  agenda: "Agenda",
  allDay: "Todo el día",
  date: "Fecha",
  time: "Hora",
  event: "Evento",
  noEventsInRange: "No hay eventos en este rango",
  showMore: (total: number) => `+${total} más`,
};

export const RESERVATION_STATUS_ES: Record<string, string> = {
  PENDING: "Pendiente",
  ACTIVE: "Activa",
  EXTENDED: "Extendida",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

export const formats = {
  dayFormat: "eeee",
  weekdayFormat: "eeeeee",
  monthHeaderFormat: "MMMM yyyy",
  dayHeaderFormat: "eeee, d MMMM",
  agendaDateFormat: "eeee, d MMMM yyyy",
  agendaTimeFormat: "HH:mm",
  agendaHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
    `${start.toLocaleDateString("es-ES")} – ${end.toLocaleDateString("es-ES")}`,
};

export const CustomToolbar: React.FC<ControlledToolbarProps> = ({
  label,
  view,
  onViewChange,
  date,
  onNavigateChange,
}) => {
  const handleNavigate = (action: NavigateAction) => {
    const newDate = handleReservationCalendar(action, date, view);
    onNavigateChange(newDate);
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-lg border border-gray-app-200 shadow-sm bg-white mb-4">
      <div className="flex gap-2 flex-wrap justify-center">
        <Button
          variant="outline"
          size="sm"
          className="bg-gray-app-100 text-gray-app-700 hover:bg-gray-app-200 shadow-md"
          onClick={() => handleNavigate("PREV")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-gray-app-100 text-gray-app-700 hover:bg-gray-app-200 shadow-md"
          onClick={() => handleNavigate("TODAY")}
        >
          <Calendar1 className="w-4 h-4 mr-1" />
          Hoy
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-gray-app-100 text-gray-app-700 hover:bg-gray-app-200 shadow-md"
          onClick={() => handleNavigate("NEXT")}
        >
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <span className="flex items-center gap-2 font-semibold text-lg md:text-xl">
        <CalendarDays className="w-5 h-5 text-blue-app" />
        {label}
      </span>

      <div className="flex gap-1 flex-wrap justify-center">
        {(["month", "week", "day", "agenda"] as const).map((v) => (
          <Button
            key={v}
            size="sm"
            variant={view === v ? "default" : "outline"}
            className={`px-3 py-1 text-sm shadow-md ${view === v ? "bg-blue-app-transparent text-white hover:bg-blue-app" : "bg-gray-app-100 hover:bg-gray-app-200"}`}
            onClick={() => onViewChange(v)}
          >
            {v === "month"
              ? "Mes"
              : v === "week"
                ? "Semana"
                : v === "day"
                  ? "Día"
                  : "Agenda"}
          </Button>
        ))}
      </div>
    </div>
  );
};
