import { Skeleton } from "@/components/ui/skeleton";

export function ServerListSkeleton() {
  return (
    <div
      className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(300px,1fr))] 
                 md:grid-cols-[repeat(auto-fit,minmax(380px,1fr))] 
                 justify-items-center w-full mb-4"
    >
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200 rounded-2xl shadow-md 
                     p-5 w-full max-w-[380px] flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex flex-col gap-1">
                <Skeleton className="h-5 w-32 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>

          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-40 rounded" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-36 rounded" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-32 rounded" />
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
