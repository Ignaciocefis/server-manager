import { GpuReservationListProps } from "./components/GpuReservationsList/GpuReservationsList.types";

export function formatCountdown(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}`;
}

export const pad = (n: number) => n.toString().padStart(2, "0");

export const getDateWithTime = (date: Date, time: string): Date => {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
};

export const truncateToMinutes = (date: Date): Date => {
  const d = new Date(date);
  d.setSeconds(0, 0);
  return d;
};

export const hasOverlap = (
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean => start1 < end2 && end1 > start2;


export function sortReservations(reservations: GpuReservationListProps[]) {
  return [...reservations].sort((a, b) => {
    const getFinalEnd = (res: GpuReservationListProps) => {
      const end = res.endDate ? new Date(res.endDate) : new Date(0);
      const extended = res.extendedAt ? new Date(res.extendedAt) : null;
      return extended && extended > end ? extended : end;
    };

    const getPriority = (status: string) => {
      switch (status) {
        case "ACTIVE":
        case "EXTENDED":
          return 0;
        case "PENDING":
          return 1;
        default:
          return 2;
      }
    };

    const priorityDiff = getPriority(a.status) - getPriority(b.status);
    if (priorityDiff !== 0) return priorityDiff;

    return getFinalEnd(a).getTime() - getFinalEnd(b).getTime();
  });
}