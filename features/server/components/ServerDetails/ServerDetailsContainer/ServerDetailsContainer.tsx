"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GpuDonutChart, ServerDetailsInfo } from "../..";
import { useServerDetails } from "./useServerDetailsContainer";
import { toggleAvailability } from "./handlers/toggleAvailabilityHandler";
import { handleDeleteServer } from "./handlers/deleteServerHandler";
import { GpuInUseTable } from "@/features/gpu/components";
import { LogsTable } from "@/features/eventLog/components";
import { TriangleAlert } from "lucide-react";
import { ConfirmDialog } from "@/components/Shared/ConfirmDialog/ConfirmDialog";
import {
  ConfirmMessageKey,
  ConfirmMessageParams,
} from "@/components/Shared/ConfirmDialog/ConfirmDialog.types";
import { useLanguage } from "@/hooks/useLanguage";
import GpuUsageHeatmap from "@/features/gpu/components/GpuUsageHeatmap/GpuUsageHeatmap";
import ServerDetailsContainerSkeleton from "./ServerDetailsContainer.skeleton";

export const ServerDetailsContainer = ({ serverId }: { serverId: string }) => {
  const router = useRouter();
  const { server, loading, error, isAdmin, triggerRefresh, setServer } =
    useServerDetails(serverId);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(
    () => () => {}
  );
  interface ConfirmParams {
    messageKey: ConfirmMessageKey;
    params: ConfirmMessageParams[ConfirmMessageKey];
  }
  const [confirmParams, setConfirmParams] = useState<ConfirmParams>({
    messageKey: "server_availability",
    params: {} as ConfirmMessageParams[ConfirmMessageKey],
  });

  const { t } = useLanguage();

  if (loading) return <ServerDetailsContainerSkeleton />;

  if (error)
    return (
      <div className="border rounded-xl shadow-md p-5 bg-red-50 mt-4 flex items-stretch gap-4">
        <div className="flex-shrink-0 flex items-center">
          <TriangleAlert className="w-10 h-full text-red-700" />
        </div>

        <div className="flex flex-col justify-center">
          <h3 className="text-lg md:text-2xl font-bold text-red-700">
            {t("Server.details.error")}
          </h3>
          <p className="text-sm md:text-base text-red-app">{error}</p>
        </div>
      </div>
    );

  if (!server)
    return (
      <div className="flex justify-center items-center h-full min-h-[300px]">
        <p className="text-2xl">{t("Server.details.not_found")}</p>
      </div>
    );

  const openConfirmDialog = (action: () => void, params: ConfirmParams) => {
    setConfirmAction(() => action);
    setConfirmParams(params);
    setConfirmDialogOpen(true);
  };

  const handleToggleAvailability = async () => {
    openConfirmDialog(
      async () => {
        setConfirmDialogOpen(false);
        try {
          await toggleAvailability(server.id, setServer, triggerRefresh);
        } catch (error) {
          console.error(error);
        }
      },
      {
        messageKey: "server_availability",
        params: { name: server.name, available: !server.available },
      }
    );
  };

  const handleDelete = async () => {
    openConfirmDialog(
      async () => {
        setConfirmDialogOpen(false);
        try {
          await handleDeleteServer(server.id, router, triggerRefresh);
        } catch (error) {
          console.error(error);
        }
      },
      {
        messageKey: "delete_server",
        params: { name: server.name },
      }
    );
  };

  return (
    <div>
      <ServerDetailsInfo
        server={server}
        isAdmin={isAdmin}
        onUpdate={triggerRefresh}
        onToggleAvailability={handleToggleAvailability}
        onDelete={handleDelete}
        onReservationSuccess={triggerRefresh}
      />

      <div className="flex flex-col 2xl:flex-row items-center justify-between w-11/12 mx-auto">
        <div className="w-full md:w-auto">
          <GpuUsageHeatmap serverId={server.id} />
        </div>

        <div className="flex md:w-auto h-max-[316px] justify-center">
          <GpuDonutChart
            installedGpus={server.installedGpus}
            availableGpus={server.availableGpus}
            size="md"
          />
        </div>
      </div>

      <div className="flex flex-col items-center mt-4">
        <GpuInUseTable data={server} />
      </div>

      <div className="mt-8 w-11/12 mx-auto">
        <LogsTable serverId={server.id} limit={10} />
      </div>

      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={confirmAction}
        messageKey={confirmParams.messageKey}
        params={confirmParams.params}
      />
    </div>
  );
};
