"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  CirclePlus,
  HardDrive,
  MemoryStick,
  ServerCog,
  ServerOff,
  Trash2,
} from "lucide-react";
import { UpdateServerDialog } from "@/app/(home)/components";
import { ServerDetailsInfoProps } from "@/app/(home)/servers/components/ServerDetailsInfo/ServerDetailsInfo.types";
import { GpuDetailsInfo } from "../GpuDetailsInfo";

export const ServerDetailsInfo: React.FC<ServerDetailsInfoProps> = ({
  server,
  isAdmin,
  onUpdate,
  onToggleAvailability,
  onDelete,
}) => {
  return (
    <div className="flex justify-center">
      <div className="flex flex-col md:flex-row px-4 py-4 m-4 w-full md:w-11/12 text-gray-app-100 bg-gray-app-600 rounded-lg">
        <div className="flex flex-col w-full md:w-2/3 pr-0 md:pr-8 p-4">
          <h1 className="text-2xl font-bold mb-4">
            Detalles del servidor: {server.name}
          </h1>
          <p className="flex items-center mb-2">
            <MemoryStick size={16} className="inline mr-2" />
            <span className="font-semibold">RAM: {server.ramGB} GB</span>
          </p>
          <p className="flex items-center mb-4">
            <HardDrive size={16} className="inline mr-2" />
            <span className="font-semibold">Discos: {server.diskCount} GB</span>
          </p>

          <div className="flex flex-col items-center gap-2 mt-4 w-full max-w-xs self-center">
            {server.available && (server.availableGpus ?? 0) > 0 ? (
              <Button className="w-full bg-green-app-500-transparent hover:bg-green-app-500">
                <CirclePlus size={16} className="mr-2" />
                Solicitar uso
              </Button>
            ) : (
              <Button className="w-full bg-gray-app-300" disabled>
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

        <div
          className={`w-full md:${(server.gpus?.length ?? 0) > 2 ? "w-1/2" : "w-1/3"} rounded-lg p-4 flex flex-col gap-4`}
        >
          <h2 className="text-xl font-semibold mb-2">GPUs instaladas</h2>
          {server.gpus && server.gpus.length > 0 ? (
            <div
              className={`gap-4 ${
                server.gpus.length > 2 ? "grid grid-cols-2" : "flex flex-col"
              }`}
            >
              {server.gpus.map((gpu) => (
                <GpuDetailsInfo
                  key={gpu.id}
                  id={gpu.id}
                  type={gpu.type}
                  name={gpu.name}
                  ramGB={gpu.ramGB}
                />
              ))}
            </div>
          ) : (
            <p>No hay GPUs disponibles.</p>
          )}
        </div>
      </div>
    </div>
  );
};
