"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { CirclePlus, ServerCog, ServerOff, Trash2 } from "lucide-react";
import { UpdateServerDialog } from "@/app/(home)/components";
import { ServerDetailsInfoProps } from "@/lib/schemas/server/details/info.schema";

export const ServerDetailsInfo: React.FC<ServerDetailsInfoProps> = ({
  server,
  isAdmin,
  onUpdate,
  onToggleAvailability,
  onDelete,
}) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="px-8 py-4 m-4 w-11/12 text-gray-app-100 bg-gray-app-600 rounded-lg">
        <h1 className="text-2xl font-bold mb-4">
          Detalles del servidor: {server.name}
        </h1>
        <p>RAM: {server.ramGB} GB</p>
        <p>Discos: {server.diskCount}</p>

        <div className="flex flex-col gap-2 mt-4 w-full max-w-xs">
          {server.available && (server.availableGpus ?? 0) > 0 ? (
            <Button className="w-full bg-green-app-500-transparent hover:bg-green-app-500 text-gray-app-100">
              <CirclePlus size={16} className="mr-2" />
              Solicitar uso
            </Button>
          ) : (
            <Button className="w-full bg-gray-app-300 text-white" disabled>
              <CirclePlus size={16} className="mr-2" />
              No disponible
            </Button>
          )}

          {isAdmin && (
            <>
              <UpdateServerDialog serverToEdit={server} onUpdate={onUpdate} />

              <Button
                className={`w-full flex items-center justify-center gap-2 ${
                  server.available
                    ? "bg-green-app-500-transparent hover:bg-green-app-500"
                    : "bg-red-app-500-transparent hover:bg-red-app-500"
                } text-white`}
                onClick={onToggleAvailability}
              >
                {server.available ? (
                  <ServerCog size={20} />
                ) : (
                  <ServerOff size={20} />
                )}
                {server.available
                  ? "Servidor disponible"
                  : "Servidor en mantenimiento"}
              </Button>
              <Button
                className="w-full bg-red-app-500-transparent hover:bg-red-app-500 text-white"
                onClick={onDelete}
              >
                <Trash2 size={20} />
                Eliminar servidor
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
