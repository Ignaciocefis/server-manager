"use client";

import { handleApiError } from "@/lib/services/errors/errors";
import { type StatisticsOverview } from "@/features/statistics/data";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

export function useStatisticsOverview(startDate?: string, endDate?: string) {
  const [overview, setOverview] = useState<StatisticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);

    await axios
      .get("/api/statistics/overview", {
        params: { startDate, endDate },
      })
      .then((res) => {
        const raw = res.data;
        if (!raw?.success) {
          throw new Error(raw?.error ?? "Unable to load statistics overview.");
        }
        setOverview({
          ...raw.data,
          recentEvents: raw.data.recentEvents.map(
            (event: { createdAt: string } & Record<string, unknown>) => ({
              ...event,
              createdAt: new Date(event.createdAt),
            }),
          ),
        });
      })
      .catch((err) => {
        const msg = handleApiError(err, true);
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return { overview, loading, error };
}
