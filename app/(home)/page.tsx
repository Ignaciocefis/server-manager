"use client";

import { PageTitle } from "@/components/Shared";
import { Input } from "@/components/ui/input";
import { GpuReservationsList } from "@/features/gpu/components";
import { CreateServerDialog, ServerList } from "@/features/server/components";
import { Search } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshKeyServer, setRefreshKeyServer] = useState(1);
  const [serverSearchTerm, setServerSearchTerm] = useState("");
  const [gpuSearchTerm, setGpuSearchTerm] = useState("");

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    setRefreshKeyServer((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col w-11/12 mx-auto space-y-8">
      <PageTitle title="Listado de servidores">
        <CreateServerDialog />
      </PageTitle>

      <section className="w-full space-y-4 items-center justify-center mx-auto">
        <div className="flex w-full items-center justify-between text-2xl font-semibold text-gray-app-600">
          <h2>Mis reservas de GPU</h2>
          <div className="relative w-full max-w-md sm:max-w-lg">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Buscar reservas de GPU..."
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
      </section>

      <hr className="w-11/12 border-t-2 border-gray-app-600 mx-auto" />

      <section className="w-full space-y-4">
        <div className="flex w-full items-center justify-between text-2xl font-semibold text-gray-app-600">
          <h2>Servidores</h2>
          <div className="relative w-full max-w-md sm:max-w-lg">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Buscar servidores..."
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
      </section>
    </div>
  );
}
