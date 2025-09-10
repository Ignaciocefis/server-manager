"use client";

import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale/es";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Loader2 } from "lucide-react";
import { CalendarEvent } from "./ReservationCalendar.types";
import {
  CALENDAR_ES,
  CustomToolbar,
  formats,
  RESERVATION_STATUS_ES,
  statusColors,
} from "./ReservationCalendar.utils";
import { useReservationCalendar } from "./useReservationCalendar";
import { ReservationDialog } from "..";

const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function ReservationCalendar() {
  const {
    events,
    loading,
    error,
    selectedEvent,
    setSelectedEvent,
    view,
    setView,
    date,
    setDate,
  } = useReservationCalendar();

  if (loading)
    return (
      <div className="flex items-center justify-center h-[700px]">
        <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
      </div>
    );

  if (error)
    return <div className="p-4 text-red-600 font-semibold">Error: {error}</div>;

  return (
    <div className="space-y-4-center">
      <div className="h-[680px] border rounded-xl shadow-md bg-white p-5">
        <Calendar<CalendarEvent>
          localizer={localizer}
          culture="es"
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={(v) => setView(v as typeof view)}
          date={date}
          onNavigate={setDate}
          views={["month", "week", "day", "agenda"]}
          defaultView="month"
          style={{ height: "100%", borderRadius: "24px" }}
          messages={CALENDAR_ES}
          formats={formats}
          components={{
            toolbar: (props) => (
              <CustomToolbar
                {...props}
                view={view}
                onViewChange={setView}
                date={date}
                onNavigateChange={setDate}
              />
            ),
          }}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: statusColors[event.resource.status],
              borderRadius: "4px",
              color: "white",
              border: "none",
              padding: "2px",
              margin: "2px",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            },
          })}
          onSelectEvent={setSelectedEvent}
        />
      </div>

      <div className="flex flex-wrap gap-4 mt-2 border rounded-xl shadow-md bg-white p-5">
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2">
            <span
              className="inline-block w-4 h-4 rounded"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm font-medium">
              {RESERVATION_STATUS_ES[status]}
            </span>
          </div>
        ))}
      </div>

      <ReservationDialog
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
