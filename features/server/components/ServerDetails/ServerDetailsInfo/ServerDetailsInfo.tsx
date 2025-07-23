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

import { ServerDetailsInfoProps } from "./ServerDetailsInfo.types";
import { GpuDetailsInfo } from "../GpuDetailsInfo/GpuDetailsInfo";
import { GpuReservationDialog } from "@/features/gpu/components";
import { UpdateServerDialog } from "../../UpdateServer/UpdateServerDialog/UpdateServerDialog";

export const ServerDetailsInfo: React.FC<ServerDetailsInfoProps> = ({
  server,
  isAdmin,
  onUpdate,
  onToggleAvailability,
  onDelete,
  onReservationSuccess,
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
            <span className="font-semibold">Discos: {server.diskCount}</span>
          </p>

          <div className="flex flex-col items-center md:items-start gap-2 mt-4 w-full">
            {server.available ? (
              <GpuReservationDialog
                serverId={server.id}
                onSuccess={onReservationSuccess}
              />
            ) : (
              <Button
                className="w-full max-w-xs bg-gray-app-300 text-white"
                disabled
              >
                <CirclePlus size={20} />
                No disponible
              </Button>
            )}

            {isAdmin && (
              <>
                <UpdateServerDialog serverToEdit={server} onUpdate={onUpdate} />

                <Button
                  className={`w-full max-w-xs ${
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
                  className="w-full max-w-xs bg-red-app-500-transparent hover:bg-red-app-500 text-white"
                  onClick={onDelete}
                >
                  <Trash2 size={20} />
                  Eliminar servidor
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="w-full md:w-2/3 lg:w-3/4 rounded-lg p-4 flex flex-col gap-4">
          <h2 className="text-xl font-semibold mb-2">GPUs instaladas</h2>

          {server.gpus && server.gpus.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
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
