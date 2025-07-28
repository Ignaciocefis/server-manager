"use client";

import { useRouter } from "next/navigation";
import { GpuDonutChart, ServerDetailsInfo } from "../..";
import { useServerDetails } from "./useServerDetailsContainer";
import { toggleAvailability } from "./handlers/toggleAvailabilityHandler";
import { handleDeleteServer } from "./handlers/deleteServerHandler";
import { GpuInUseTable } from "@/features/gpu/components";

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
      <div className="flex justify-center items-center h-full min-h-[300px]">
        <p className="text-2xl text-red-500">{error}</p>
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
        onUpdate={setServer}
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
    </>
  );
};
