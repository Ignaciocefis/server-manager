"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useLanguage } from "@/hooks/useLanguage";
import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";

type ReservationStatusPoint = {
  name: string;
  label: string;
  value: number;
  fill: string;
};

type ActivityPoint = {
  date: string;
  label: string;
  count: number;
};

interface StatisticsChartsProps {
  reservationStatus: ReservationStatusPoint[];
  activitySeries: ActivityPoint[];
  activityTitle: string;
  activitySummary: string;
}

export function StatisticsCharts({
  reservationStatus,
  activitySeries,
  activityTitle,
  activitySummary,
}: StatisticsChartsProps) {
  const { t } = useLanguage();

  const reservationConfig = reservationStatus.reduce((config, item) => {
    config[item.name] = {
      label: item.label,
      color: item.fill,
    };
    return config;
  }, {} as ChartConfig);

  const activityConfig = {
    count: {
      label: activitySummary,
      color: "#2563eb",
    },
  } satisfies ChartConfig;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="border border-gray-app-200 shadow-md bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-gray-app-700">
            {t("app.statistics.reservationStatusTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={reservationConfig}
            className="mx-auto h-80 w-full"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={reservationStatus}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
              >
                {reservationStatus.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {reservationStatus.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-lg border border-gray-app-200 px-3 py-2"
              >
                <div className="flex items-center gap-2 text-sm text-gray-app-600">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span>{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-gray-app-700">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-app-200 shadow-md bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold text-gray-app-700">
            {activityTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={activityConfig}
            className="mx-auto h-80 w-full"
          >
            <BarChart data={activitySeries}>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                interval={0}
              />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <ChartTooltip
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar dataKey="count" fill="var(--color-count)" radius={6} />
            </BarChart>
          </ChartContainer>

          <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-app-200 px-3 py-2 text-sm text-gray-app-600">
            <span>{activitySummary}</span>
            <span className="font-semibold text-gray-app-700">
              {activitySeries.reduce((total, item) => total + item.count, 0)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
