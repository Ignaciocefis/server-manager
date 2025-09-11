import { Skeleton } from "@/components/ui/skeleton";

export function GpuReservationListSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))] items-center place-items-center">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className={`bg-gray-app-500 text-gray-app-100 rounded-xl p-4 w-[250px] 
                    ${i > 0 ? "hidden sm:block" : ""}`}
        >
          <div className="flex w-full items-center mb-4">
            <Skeleton className="h-6 w-32 rounded" />
          </div>

          <div className="space-y-4 mt-8">
            <div>
              <Skeleton className="h-4 w-40 mb-2 rounded" />
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="flex items-center gap-2 mb-2 w-full">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
                <div className="flex items-center gap-2 mb-2 w-full">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
              </div>
            </div>

            <div>
              <Skeleton className="h-4 w-40 mb-2 rounded" />
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="flex items-center gap-2 mb-2 w-full">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
                <div className="flex items-center gap-2 mb-2 w-full">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-8">
            <div className="flex justify-center items-center w-full sm:w-auto">
              <Skeleton className="h-[3.5rem] w-32 rounded" />
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs sm:w-auto">
              <Skeleton className="h-8 w-full sm:w-28 rounded" />
              <Skeleton className="h-8 w-full sm:w-28 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
