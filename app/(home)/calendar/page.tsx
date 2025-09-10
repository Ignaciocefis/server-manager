import ReservationCalendar from "@/features/gpu/components/ReservationCalendar/ReservationCalendar";
import { CalendarDays } from "lucide-react";

export default function page() {
  return (
    <div className="w-11/12 mx-auto">
      <div className="border rounded-xl shadow-md bg-white p-5">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-8 h-8 text-blue-app" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-app-700">
            Calendario de reservas
          </h1>
        </div>
        <p className="text-sm md:text-base text-gray-app-500 md:ml-4 pl-8">
          Consulta las reservas de Tarjetas Gráficas en un calendario. Haga clic
          en una reserva para ver más detalles.
        </p>
      </div>
      <div className="mt-4"></div>
      <ReservationCalendar />
    </div>
  );
}
