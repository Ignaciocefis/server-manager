"use client";

import React, { JSX } from "react";
import ServerCard from "../ServerCard/ServerCard";
import { useServerList } from "./useServerList";
import { ServerListSkeleton } from "./ServerList.skeleton";
import { TriangleAlert } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export function ServerList({
  onReservationSuccess,
  searchTerm,
}: {
  onReservationSuccess: () => void;
  searchTerm: string;
}): JSX.Element {
  const { servers, loading, error } = useServerList();

  const { t } = useLanguage();

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
            {t("Server.serverList.errorLoadingServers")}
          </h3>
          <p className="text-sm md:text-base text-red-app">{error}</p>
        </div>
      </div>
    );

  if (servers.length === 0) {
    return (
      <p className="col-span-full text-center">
        {t("Server.serverList.noAssignedServers")}
      </p>
    );
  }

  const filteredServers = servers.filter((server) =>
    server.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredServers.length === 0) {
    return (
      <p className="col-span-full text-center">
        {t("Server.serverList.noSearchResults")}
      </p>
    );
  }

  return (
    <div
      className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(300px,1fr))] 
                md:grid-cols-[repeat(auto-fit,minmax(380px,1fr))] 
                justify-items-center w-full mb-4"
    >
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
