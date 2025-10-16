"use client";

import { Input } from "@/components/ui/input";
import { GpuReservationsList } from "@/features/gpu/components";
import { CreateServerDialog, ServerList } from "@/features/server/components";
import { useHasCategory } from "@/hooks/useHasCategory";
import { useLanguage } from "@/hooks/useLanguage";
import { Gpu, PcCase, Search, Server } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshKeyServer, setRefreshKeyServer] = useState(1);
  const [serverSearchTerm, setServerSearchTerm] = useState("");
  const [gpuSearchTerm, setGpuSearchTerm] = useState("");

  const { t } = useLanguage();
  const { hasCategory } = useHasCategory(["ADMIN"]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    setRefreshKeyServer((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col w-11/12 mx-auto margin-y-4">
      <div className="border rounded-xl shadow-md bg-white p-5 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <PcCase className="w-8 h-8 text-blue-app" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-app-700">
              {t("app.home.serverList")}
            </h1>
          </div>
          <p className="text-sm md:text-base text-gray-app-500 ml-3 pl-8">
            {t("app.home.serverListDescription")}
          </p>
        </div>

        {hasCategory && <CreateServerDialog />}
      </div>

      <div className="border rounded-xl shadow-md bg-white p-5 flex flex-col gap-4 mt-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-lg border border-gray-app-200 shadow-sm bg-white mb-4">
          <div className="flex items-center gap-3">
            <Gpu className="w-6 h-6 text-blue-app" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-app-700">
              {t("app.home.gpuReservations")}
            </h2>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder={t("app.home.searchGpu")}
              className="pl-12 py-3 text-lg"
              onChange={(e) => setGpuSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <GpuReservationsList
          refresh={handleRefresh}
          key={refreshKey}
          gpuSearchTerm={gpuSearchTerm}
        />
      </div>

      <div className="border rounded-xl shadow-md bg-white p-5 flex flex-col gap-4 mt-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-lg border border-gray-app-200 shadow-sm bg-white mb-4">
          <div className="flex items-center gap-3">
            <Server className="w-6 h-6 text-blue-app" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-app-700">
              {t("app.home.accessibleServers")}
            </h2>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder={t("app.home.searchServer")}
              className="pl-12 py-3 text-lg"
              onChange={(e) => setServerSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ServerList
          onReservationSuccess={handleRefresh}
          key={refreshKeyServer}
          searchTerm={serverSearchTerm}
        />
      </div>
    </div>
  );
}
