"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function ServerDetailsLoading() {
  return (
    <div className="w-full flex flex-col gap-8 items-center">
      <div className="w-11/12 mx-auto flex flex-col gap-6">
        <div className="border rounded-xl shadow-md bg-white p-5">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="h-8 w-48 rounded" />
          </div>
          <Skeleton className="h-4 w-3/4 ml-11 mt-2" />
        </div>

        <div className="w-full border rounded-xl shadow-md bg-white p-5 flex flex-col gap-4 -mt-2">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-lg border border-gray-app-200 shadow-sm bg-white mb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-6 w-48 rounded" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="flex flex-col gap-3 items-start p-0 px-4 py-3 w-full md:w-1/2">
              <div className="flex flex-col gap-2 w-full">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>

              <div className="w-full flex justify-center my-4">
                <div className="border-t border-gray-200 w-1/4" />
              </div>

              <div className="flex flex-col items-center md:items-start gap-2 w-full">
                <Skeleton className="h-10 w-full max-w-xs rounded-md" />
                <Skeleton className="h-10 w-full max-w-xs rounded-md" />
                <Skeleton className="h-10 w-full max-w-xs rounded-md" />
              </div>
            </div>

            <div className="w-full md:w-1/2 rounded-lg p-4 flex flex-col gap-4">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="border rounded-xl shadow-sm bg-gray-50 p-4 flex flex-col gap-3"
                  >
                    <Skeleton className="h-5 w-24 rounded" />
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-4 w-16 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col 2xl:flex-row items-center justify-between w-11/12 mx-auto gap-6">
        <div className="w-full 2xl:w-[70%] border rounded-xl shadow-md bg-white p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-app-200 shadow-sm bg-white">
            <div className="flex items-center gap-3">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-6 w-48 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-12 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>

          <Skeleton className="h-[130px] w-full rounded-md" />

          <div className="flex flex-wrap gap-4 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex 2xl:w-[20%] justify-center w-full">
          <div className="w-full border rounded-xl shadow-md bg-white p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-app-200 shadow-sm bg-white mb-2">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-6 w-40 rounded" />
            </div>

            <div className="flex justify-center items-center h-[130px]">
              <Skeleton className="h-[130px] w-[130px] rounded-full" />
            </div>

            <Skeleton className="h-4 w-2/3 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
