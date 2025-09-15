"use client";

import { useRouter } from "next/navigation";
import { GpuDonutChart, ServerDetailsInfo } from "../..";
import { useServerDetails } from "./useServerDetailsContainer";
import { toggleAvailability } from "./handlers/toggleAvailabilityHandler";
import { handleDeleteServer } from "./handlers/deleteServerHandler";
import { GpuInUseTable } from "@/features/gpu/components";
import { LogsTable } from "@/features/eventLog/components";
import { TriangleAlert } from "lucide-react";

export const ServerDetailsContainer = ({ serverId }: { serverId: string }) => {
  const router = useRouter();

  const { server, loading, error, isAdmin, triggerRefresh, setServer } =
    useServerDetails(serverId);

  if (loading)
    return (
      <div className="flex justify-center items-center h-full min-h-[300px]">
        <p className="text-2xl">Cargando servidor...</p>
      </div>
    );

  if (error)
    return (
      <div className="border rounded-xl shadow-md p-5 bg-red-50 mt-4 flex items-stretch gap-4">
        <div className="flex-shrink-0 flex items-center">
          <TriangleAlert className="w-10 h-full text-red-700" />
        </div>

        <div className="flex flex-col justify-center">
          <h3 className="text-lg md:text-2xl font-bold text-red-700">
            Ha ocurrido un error
          </h3>
          <p className="text-sm md:text-base text-red-app">{error}</p>
        </div>
      </div>
    );

  if (!server)
    return (
      <div className="flex justify-center items-center h-full min-h-[300px]">
        <p className="text-2xl">Servidor no encontrado</p>
      </div>
    );

  return (
    <>
      <ServerDetailsInfo
        server={server}
        isAdmin={isAdmin}
        onUpdate={triggerRefresh}
        onToggleAvailability={() =>
          toggleAvailability(server.id, setServer, () => {})
        }
        onDelete={() => handleDeleteServer(server.id, router, () => {})}
        onReservationSuccess={triggerRefresh}
      />

      <div className="flex flex-col items-center mt-8">
        <GpuDonutChart
          installedGpus={server.installedGpus}
          availableGpus={server.availableGpus}
          size="md"
        />
      </div>

      <div className="flex flex-col items-center my-8">
        <GpuInUseTable data={server} />
      </div>

      <div>
        <LogsTable serverId={server.id} limit={10} />
      </div>
    </>
  );
};
