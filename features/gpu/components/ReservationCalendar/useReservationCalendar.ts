import { useEffect, useState } from "react";
import { reservationForCalendar } from "@/features/gpu/types";
import { CalendarEvent } from "./ReservationCalendar.types";

export function useReservationCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const [view, setView] = useState<"month" | "week" | "day" | "agenda">("week");
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/gpu/calendar");
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Error al obtener reservas");

        const mappedEvents: CalendarEvent[] = data.data.map(
          (r: reservationForCalendar) => ({
            id: r.id,
            title: `${r.userName} - ${r.gpuName} @ ${r.serverName}`,
            start: new Date(r.startDate),
            end: new Date(r.endDate),
            resource: {
              ...r,
              startDate: new Date(r.startDate),
              endDate: new Date(r.endDate),
            },
          })
        );

        setEvents(mappedEvents);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  return {
    events,
    loading,
    error,
    selectedEvent,
    setSelectedEvent,
    view,
    setView,
    date,
    setDate,
  };
}
