"use client";

import { PieChart, Pie } from "recharts";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { GpuDonutChartProps } from "./GpuDonutChart.types";
import { Donut } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export function GpuDonutChart({
  installedGpus = 0,
  availableGpus = 0,
  size = "md",
}: GpuDonutChartProps) {
  const usedGpus = Math.max(installedGpus - availableGpus, 0);

  const { t, language } = useLanguage();

  const chartData = [
    {
      type: t("Server.details.donutChartAvailable"),
      value: availableGpus,
      fill: "var(--color-gray-app-100)",
    },
    {
      type: t("Server.details.donutChartUsed"),
      value: usedGpus,
      fill: "var(--color-gray-app-400)",
    },
  ];

  const chartConfig = {
    value: { label: "GPUs" },
    Disponibles: {
      label: t("Server.details.donutChartAvailable"),
      color: "var(--color-gray-app-100)",
    },
    Ocupadas: {
      label: t("Server.details.donutChartUsed"),
      color: "var(--color-gray-app-400)",
    },
  } satisfies ChartConfig;

  if (size === "icon") {
    return (
      <div className="inline-block">
        <PieChart width={24} height={24}>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="type"
            innerRadius={6}
            outerRadius={12}
            stroke="none"
            isAnimationActive={false}
          />
        </PieChart>
      </div>
    );
  }

  return (
    <Card className="w-full border rounded-xl shadow-md bg-white p-5 flex flex-col gap-4 mt-4">
      <CardHeader className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-lg border border-gray-app-200 shadow-sm bg-white mb-4">
        <div className="flex items-center gap-3">
          <Donut className="w-6 h-6 text-blue-app" />
          <CardTitle className="text-xl md:text-2xl font-bold text-gray-app-700">
            {t("Server.details.donutChartTitle")}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto w-full aspect-square"
        >
          <PieChart width={250} height={250}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="type"
              innerRadius={60}
              outerRadius={90}
              strokeWidth={5}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="text-muted-foreground leading-none">
          {language === "es"
            ? `${availableGpus} GPUs disponibles de ${installedGpus} instaladas`
            : `${availableGpus} available GPUs of ${installedGpus} installed`}
        </div>
      </CardFooter>
    </Card>
  );
}
