"use client";

import React, { JSX } from "react";
import ServerCard from "../ServerCard/ServerCard";
import { useServerList } from "./useServerList";

export function ServerList({
  onReservationSuccess,
}: {
  onReservationSuccess: () => void;
}): JSX.Element {
  const { servers, loading, error } = useServerList();

  if (loading) {
    return <p className="p-4">Cargando servidores...</p>;
  }

  if (error) {
    return <p className="p-4 text-red-500">{error}</p>;
  }

  if (servers.length === 0) {
    return <p className="p-4">No tienes servidores asignados.</p>;
  }

  return (
    <div className="w-11/12 m-4 grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))] items-center place-items-center">
      {servers.map((server) => (
        <ServerCard
          key={server.id}
          server={server}
          onReservationSuccess={onReservationSuccess}
        />
      ))}
    </div>
  );
}
