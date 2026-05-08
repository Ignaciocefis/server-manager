import { StatisticsContent, StatisticsSkeleton } from "@/features/statistics/components/StatisticsContent";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<StatisticsSkeleton />}>
      <StatisticsContent />
    </Suspense>
  );
}
