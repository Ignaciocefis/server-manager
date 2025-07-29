import { useEffect, useState } from "react";
import { isAfter } from "date-fns";
import { formatCountdown } from "../../utils";
import { UseRersevationIdCardProps } from "./GpuReservationCard.types";

export function useGpuCountdown({
  status,
  startDate,
  endDate,
  extendedAt,
  extendedUntil,
}: UseRersevationIdCardProps) {
  const [countdown, setCountdown] = useState<string | null>(null);

  const finalEnd = (() => {
    if (status === "EXTENDED" && extendedUntil) return extendedUntil;
    if (extendedAt && endDate) return isAfter(extendedAt, endDate) ? extendedAt : endDate;
    return endDate;
  })();

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      if (status === "PENDING" && startDate) {
        const diffSeconds = Math.max(0, Math.floor((startDate.getTime() - now.getTime()) / 1000));
        setCountdown(diffSeconds === 0 ? "Comenzando..." : formatCountdown(diffSeconds));
      } else if ((status === "ACTIVE" || status === "EXTENDED") && finalEnd) {
        const diffSeconds = Math.max(0, Math.floor((finalEnd.getTime() - now.getTime()) / 1000));
        setCountdown(diffSeconds === 0 ? "Finalizado" : formatCountdown(diffSeconds));
      } else {
        setCountdown(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status, startDate, finalEnd]);

  return { countdown, finalEnd };
}
