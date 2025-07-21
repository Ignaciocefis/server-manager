"use client";

import { useState } from "react";
import { CreateServerDialog, GpuReservationsList } from "./components";
import { PageTitle } from "../../components/Shared/PageTitle";
import { ServerList } from "./components/Server/ServerList";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <PageTitle title="Listado de servidores">
        <CreateServerDialog />
      </PageTitle>
      <h2 className="mt-8 text-2xl font-semibold text-gray-app-600">
        Mis tarjetas gráficas reservadas
      </h2>
      <GpuReservationsList key={refreshKey} />
      <hr className="w-4/5 mx-auto border-t-2 border-gray-app-600" />
      <h2 className="mt-8 text-2xl font-semibold text-gray-app-600">
        Mis servidores disponibles
      </h2>
      <ServerList onReservationSuccess={handleRefresh} />
    </div>
  );
}
