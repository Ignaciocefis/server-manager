"use client";

import { PieChart, Pie } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
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

export function GpuDonutChart({
  installedGpus = 0,
  availableGpus = 0,
  size = "md",
}: GpuDonutChartProps) {
  const usedGpus = Math.max(installedGpus - availableGpus, 0);

  const chartData = [
    {
      type: "Disponibles",
      value: availableGpus,
      fill: "var(--color-gray-app-100)",
    },
    {
      type: "Ocupadas",
      value: usedGpus,
      fill: "var(--color-gray-app-400)",
    },
  ];

  const chartConfig = {
    value: { label: "GPUs" },
    Disponibles: {
      label: "Disponibles",
      color: "var(--color-gray-app-100)",
    },
    Ocupadas: {
      label: "Ocupadas",
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
    <Card className="flex flex-col bg-gray-app-600 text-gray-app-0">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-xl font-semibold mb-2">
          Disponibilidad de GPUs
        </CardTitle>
        <CardDescription>Libres vs Ocupadas</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto w-full max-w-[250px] aspect-square"
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
          {availableGpus} GPUs disponibles de {installedGpus} instaladas
        </div>
      </CardFooter>
    </Card>
  );
}
