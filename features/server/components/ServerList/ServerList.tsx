"use client";

import React, { JSX } from "react";
import ServerCard from "../ServerCard/ServerCard";
import { useServerList } from "./useServerList";
import { ServerListSkeleton } from "./ServerList.skeleton";
import { TriangleAlert } from "lucide-react";

export function ServerList({
  onReservationSuccess,
  searchTerm,
}: {
  onReservationSuccess: () => void;
  searchTerm: string;
}): JSX.Element {
  const { servers, loading, error } = useServerList();

  if (loading) {
    return <ServerListSkeleton />;
  }

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

  if (servers.length === 0) {
    return (
      <p className="col-span-full text-center">
        No tienes servidores asignados.
      </p>
    );
  }

  const filteredServers = servers.filter((server) =>
    server.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredServers.length === 0) {
    return (
      <p className="col-span-full text-center">
        No se encontraron resultados para la búsqueda.
      </p>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))] items-center place-items-center">
      {filteredServers.map((server) => (
        <ServerCard
          key={server.id}
          server={server}
          onReservationSuccess={onReservationSuccess}
        />
      ))}
    </div>
  );
}
