"use client";

import React, { JSX } from "react";
import ServerCard from "../ServerCard/ServerCard";
import { useServerList } from "./useServerList";

export function ServerList({
  onReservationSuccess,
  searchTerm,
}: {
  onReservationSuccess: () => void;
  searchTerm: string;
}): JSX.Element {
  const { servers, loading, error } = useServerList();

  if (loading) {
    return <p className="col-span-full text-center">Cargando servidores...</p>;
  }

  if (error) {
    return <p className="col-span-full text-center text-red-500">{error}</p>;
  }

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
