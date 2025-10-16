import { Skeleton } from "@/components/ui/skeleton";

export function GpuReservationListSkeleton() {
  return (
    <div
      className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(300px,1fr))] 
                 md:grid-cols-[repeat(auto-fit,minmax(380px,1fr))] 
                 justify-items-center w-full"
    >
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="bg-white text-gray-900 rounded-2xl p-4 w-auto md:w-[380px] md:h-[290px] 
                     shadow-md border border-gray-200 flex flex-col"
        >
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-6 w-32 rounded" />
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-32 rounded" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 my-12" />

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-36 rounded" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 mt-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-24 rounded" />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-5 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex justify-center items-center w-full sm:w-auto">
              <Skeleton className="h-[3.5rem] w-40 rounded-md" />
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs sm:w-auto">
              <Skeleton className="h-9 w-full sm:w-40 rounded-md" />
              <Skeleton className="h-9 w-full sm:w-40 rounded-md" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
