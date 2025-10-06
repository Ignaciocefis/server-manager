import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CirclePlus, Cpu, Gpu, PlusCircle, Server } from "lucide-react";
import Link from "next/link";
import { GpuDonutChart } from "..";
import { ServerListItem } from "../../types";
import { GpuReservationDialog } from "@/features/gpu/components";
import { useLanguage } from "@/hooks/useLanguage";

export default function ServerCard({
  server,
  onReservationSuccess,
}: {
  server: ServerListItem;
  onReservationSuccess: () => void;
}) {
  const { t } = useLanguage();

  return (
    <Card className="bg-white text-gray-900 rounded-2xl p-4 w-full max-w-[340px] shadow-md border border-gray-200">
      <Link
        href={`/servers/${server.id}`}
        className="w-auto md:w-[340px] cursor-pointer"
      >
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3 -ml-5">
              <Server className="w-6 h-6 text-blue-app" />
              <CardTitle className="text-xl font-bold">{server.name}</CardTitle>
            </div>
            <div className="mr-2">
              <GpuDonutChart
                installedGpus={server.installedGpus}
                availableGpus={server.availableGpus}
                size="icon"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 items-start p-0 px-4 py-3">
          <div className="flex flex-col gap-2 text-sm text-gray-700 w-full">
            <div className="flex items-center gap-2">
              <Cpu size={16} className="text-gray-500" />
              <span className="font-medium">RAM:</span>
              <span>{server.ramGB} GB</span>
            </div>

            <div className="flex items-center gap-2">
              <Gpu size={16} className="text-gray-500" />
              <span className="font-medium">
                {t("Server.serverList.installedGpus")}
              </span>
              <span>{server.installedGpus ?? 0}</span>
            </div>

            <div className="flex items-center gap-2">
              <CirclePlus size={16} className="text-blue-600" />
              <span className="font-medium">
                {t("Server.serverList.availableGpus")}
              </span>
              <span>{server.availableGpus ?? 0}</span>
            </div>
          </div>
        </CardContent>
      </Link>
      <div className="w-full flex justify-center">
        <div className="border-t border-gray-200 w-full mb-4 mx-auto"></div>
      </div>
      <div className="w-full flex justify-center -mt-6 mb-4">
        {server.available ? (
          <GpuReservationDialog
            serverId={server.id}
            onSuccess={onReservationSuccess}
          />
        ) : (
          <Button
            disabled
            className="bg-gray-app-100 hover:bg-gray-app-100 text-gray-app-600 font-bold shadow-md cursor-not-allowed w-full max-w-xs"
          >
            <PlusCircle size={16} />
            {t("Server.serverList.noAvailableGpus")}
          </Button>
        )}
      </div>
    </Card>
  );
}
