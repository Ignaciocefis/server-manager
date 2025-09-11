import { Skeleton } from "@/components/ui/skeleton";

export function ServerListSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))] items-center place-items-center">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className={`bg-gray-app-500 text-gray-app-100 rounded-xl p-4 w-[200px] 
            ${i > 0 ? "hidden sm:block" : ""}`}
        >
          <div className="flex flex-col gap-2 items-start p-0 w-full">
            <div className="flex justify-between w-full items-center mb-2">
              <Skeleton className="h-6 w-24 rounded" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="flex items-center gap-2 w-full">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-28 rounded" />
            </div>
            <div className="flex items-center gap-2 w-full">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-36 rounded" />
            </div>
            <div className="flex items-center gap-2 w-full">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-40 rounded" />
            </div>
            <Skeleton className="h-8 w-full rounded mt-2" />
            <Skeleton className="h-8 w-full rounded mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}
