"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  CirclePlus,
  Cpu,
  HardDrive,
  Microchip,
  Server,
  ServerCog,
  ServerOff,
  Trash2,
} from "lucide-react";

import { ServerDetailsInfoProps } from "./ServerDetailsInfo.types";
import { GpuDetailsInfo } from "../GpuDetailsInfo/GpuDetailsInfo";
import { GpuReservationDialog } from "@/features/gpu/components";
import { UpdateServerDialog } from "../../UpdateServer/UpdateServerDialog/UpdateServerDialog";
import { useLanguage } from "@/hooks/useLanguage";

export const ServerDetailsInfo: React.FC<ServerDetailsInfoProps> = ({
  server,
  isAdmin,
  onUpdate,
  onToggleAvailability,
  onDelete,
  onReservationSuccess,
}) => {
  const { t } = useLanguage();

  return (
    <div className="w-11/12 mx-auto flex flex-col gap-6">
      <div className="border rounded-xl shadow-md bg-white p-5">
        <div className="flex items-center gap-3">
          <Server className="w-8 h-8 text-blue-app" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-app-700">
            {server.name}
          </h1>
        </div>
        <p className="text-sm md:text-base text-gray-app-500 ml-11">
          {t("Server.details.description")}
        </p>
      </div>

      <div className="w-full border rounded-xl shadow-md bg-white p-5 flex flex-col gap-4 -mt-2">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-lg border border-gray-app-200 shadow-sm bg-white mb-4">
          <div className="flex items-center gap-3">
            <Microchip className="w-6 h-6 text-blue-app" />
            <div className="text-xl md:text-2xl font-bold text-gray-app-700">
              {t("Server.details.serverDetails")}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="flex flex-col gap-3 items-start p-0 px-4 py-3">
            <div className="flex flex-col">
              <div className="flex flex-col gap-2 text-sm text-gray-700 w-full">
                <div className="flex items-center gap-2">
                  <Cpu size={16} className="text-gray-500" />
                  <span className="font-medium">RAM:</span>
                  <span>{server.ramGB} GB</span>
                </div>

                <div className="flex items-center gap-2">
                  <HardDrive size={16} className="text-gray-500" />
                  <span className="font-medium">
                    {t("Server.details.diskCount")}
                  </span>
                  <span>{server.diskCount ?? 0}</span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-120">
              <div className="border-t border-gray-200 w-full mb-4 mx-auto"></div>
            </div>

            <div className="flex flex-col items-center md:items-start gap-2 w-full">
              {server.available ? (
                <GpuReservationDialog
                  serverId={server.id}
                  onSuccess={onReservationSuccess}
                />
              ) : (
                <Button
                  className="bg-gray-app-100 hover:bg-gray-app-100 text-gray-app-600 font-bold shadow-md cursor-not-allowed w-full max-w-xs"
                  disabled
                >
                  <CirclePlus size={20} />
                  {t("Server.details.not_available")}
                </Button>
              )}

              {isAdmin && (
                <>
                  <UpdateServerDialog
                    serverToEdit={server}
                    onUpdate={onUpdate}
                  />

                  <Button
                    className={`w-full max-w-xs ${
                      server.available
                        ? "bg-green-app-100 text-gray-app-600 font-bold hover:bg-green-app shadow-md cursor-pointer"
                        : "bg-red-app-100 text-gray-app-600 font-bold hover:bg-red-app shadow-md cursor-pointer"
                    }`}
                    onClick={onToggleAvailability}
                  >
                    {server.available ? (
                      <ServerCog size={20} />
                    ) : (
                      <ServerOff size={20} />
                    )}
                    {server.available
                      ? t("Server.details.set_maintenance")
                      : t("Server.details.set_available")}
                  </Button>

                  <Button
                    className="bg-red-app-100 text-gray-app-600 font-bold hover:bg-red-app shadow-md cursor-pointer w-full max-w-xs"
                    onClick={onDelete}
                  >
                    <Trash2 size={20} />
                    {t("Server.details.delete_server")}
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="w-full md:hidden">
            <div className="border-t border-gray-200 w-full mb-4 mx-auto"></div>
          </div>

          <div className="w-full md:w-1/2 rounded-lg p-4 flex flex-col gap-4">
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
              <p>{t("Gpu.reservationsList.noAvailableGpus")}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
