"use client";

import ReservationCalendar from "@/features/gpu/components/ReservationCalendar/ReservationCalendar";
import { useLanguage } from "@/hooks/useLanguage";
import { CalendarDays } from "lucide-react";

export default function Page() {
  const { t } = useLanguage();

  return (
    <div className="w-11/12 mx-auto">
      <div className="border rounded-xl shadow-md bg-white p-5">
        <div className="flex items-center gap-3">
          <CalendarDays className="w-8 h-8 text-blue-app" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-app-700">
            {t("Gpu.calendar.title")}
          </h1>
        </div>
        <p className="text-sm md:text-base text-gray-app-500 md:ml-4 pl-8">
          {t("Gpu.calendar.description")}
        </p>
      </div>
      <div className="mt-4"></div>
      <ReservationCalendar />
    </div>
  );
}
