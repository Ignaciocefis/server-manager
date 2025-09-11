"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ReservationCalendarSkeleton() {
  return (
    <div>
      <div className="space-y-4 bg-white p-5 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-xl shadow-md border border-gray-app-200 bg-white mb-4">
          <div className="flex gap-2 flex-wrap justify-center">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>

          <Skeleton className="h-8 w-50 rounded-md" />

          <div className="flex gap-2 flex-wrap justify-center">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-16 rounded-md" />
            ))}
          </div>
        </div>

        <div className="border shadow-md bg-white p-5">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-md" />
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 sm:hidden">
            {Array.from({ length: 70 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>

          <div className="hidden sm:grid grid-cols-7 gap-2">
            {Array.from({ length: 91 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 mt-2 border rounded-xl shadow-md bg-white p-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 w-20 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
