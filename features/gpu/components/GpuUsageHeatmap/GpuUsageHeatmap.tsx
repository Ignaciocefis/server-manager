"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, ArrowRight, Calendar1, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import {
  monthNames_en,
  monthNames_es,
  weekDays_en,
  weekDays_es,
} from "./GpuUsageHeatmap.utils";

interface GpuUsageByDay {
  date: string;
  count: number;
}

interface HeatmapProps {
  serverId: string;
}

const getColorClass = (count: number | undefined) => {
  if (!count) return "bg-gray-200";
  if (count === 1) return "bg-green-200";
  if (count === 2) return "bg-green-400";
  if (count === 3) return "bg-green-600";
  return "bg-green-800";
};

const formatDateSpain = (d: Date) => {
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().split("T")[0];
};

const getDaysOfYear = (year: number) => {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const days: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
};

export default function Heatmap({ serverId }: HeatmapProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [usage, setUsage] = useState<GpuUsageByDay[]>([]);
  const [loading, setLoading] = useState(false);

  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchUsage = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `/api/gpu/heatmap?year=${year}&serverId=${serverId}`
        );
        if (res.data.success) setUsage(res.data.data);
        else setUsage([]);
      } catch (err) {
        console.error(err);
        setUsage([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, [year, serverId]);

  const usageMap: Record<string, number> = {};
  usage.forEach((u) => (usageMap[u.date] = u.count));

  const daysOfYear = getDaysOfYear(year);

  const weeks: (Date | null)[][] = [];
  let currentWeek: (Date | null)[] = [];
  const firstDay = daysOfYear[0];
  for (let i = 0; i < firstDay.getDay(); i++) currentWeek.push(null);
  daysOfYear.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  const monthNames = language === "es" ? monthNames_es : monthNames_en;
  const weekDays = language === "es" ? weekDays_es : weekDays_en;

  return (
    <div className="w-full border rounded-xl shadow-md bg-white p-5 flex flex-col gap-4 mt-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-lg border border-gray-app-200 shadow-sm bg-white mb-4">
        <div className="flex items-center gap-3">
          <CalendarCheck className="w-6 h-6 text-blue-app" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-app-700">
            {t("Server.details.usageHeatmap")}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-gray-app-100 text-gray-app-600 font-bold hover:bg-gray-app-200 shadow-md cursor-pointer w-auto "
            onClick={() => setYear((y) => y - 1)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-gray-app-100 text-gray-app-600 font-bold hover:bg-gray-app-200 shadow-md cursor-pointer w-auto"
            onClick={() => setYear(currentYear)}
          >
            <Calendar1 className="w-4 h-4 mr-1" />
            {year}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-gray-app-100 text-gray-app-600 font-bold hover:bg-gray-app-200 shadow-md cursor-pointer w-auto"
            onClick={() => setYear((y) => y + 1)}
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div className="overflow-x-auto ">
          <div className="inline-block min-w-max">
            <div className="flex justify-between px-2 mb-1 mr-5 ml-15">
              {monthNames.map((m) => (
                <div key={m} className="text-xs font-semibold text-center">
                  {m}
                </div>
              ))}
            </div>

            <div className="flex">
              <div className="flex flex-col mr-1">
                {weekDays.map((d) => (
                  <div
                    key={d}
                    className="w-8 h-5 md:h-8 flex items-center justify-center text-xs font-semibold mb-1"
                  >
                    {d}
                  </div>
                ))}
              </div>

              <div className="flex">
                {weeks.map((week, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    {week.map((day, j) => (
                      <div
                        key={j}
                        className={`w-5 h-5 md:w-8 md:h-8 rounded border ${day ? getColorClass(usageMap[formatDateSpain(day)]) : "bg-transparent"} border-gray-100`}
                        title={
                          day
                            ? `${formatDateSpain(day)}: ${usageMap[formatDateSpain(day)] || 0}`
                            : ""
                        }
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
