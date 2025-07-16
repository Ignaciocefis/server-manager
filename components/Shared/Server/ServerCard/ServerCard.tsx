import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cpu, Gpu, Info, Plus, CirclePlus } from "lucide-react";
import { ServerListItem } from "@/app/(home)/components/Server/ServerList/ServerList.types";
import Link from "next/link";
import { GpuDonutChart } from "../GpuDonutChart";
import { GpuReservationDialog } from "@/app/(home)/components";

export default function ServerCard({ server }: { server: ServerListItem }) {
  return (
    <Card className="bg-gray-app-500 text-gray-app-100 rounded-xl p-4 w-[200px]">
      <CardContent className="flex flex-col gap-2 items-start p-0">
        <div className="flex justify-between w-full items-center">
          <h2 className="text-xl font-bold">{server.name}</h2>
          <GpuDonutChart
            installedGpus={server.installedGpus}
            availableGpus={server.availableGpus}
            size="icon"
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-app-100">
          <Cpu size={16} />
          <span>RAM: {server.ramGB} GB</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-app-100">
          <Gpu size={16} />
          <span>Gráficas instaladas: {server.installedGpus ?? 0}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-app-100">
          <Plus size={16} />
          <span>Gráficas disponibles: {server.availableGpus ?? 0}</span>
        </div>

        <Link href={`/servers/${server.id}`} className="w-full mt-2">
          <Button
            variant="secondary"
            className="w-full bg-gray-app-600 text-gray-app-100 hover:bg-gray-app-400"
          >
            <Info size={16} className="mr-2" />
            Detalles
          </Button>
        </Link>

        {server.available && (server.availableGpus ?? 0) > 0 ? (
          <GpuReservationDialog serverId={server.id} />
        ) : server.available && (server.availableGpus ?? 0) === 0 ? (
          <Button className="w-full mt-1 bg-gray-app-300 text-white" disabled>
            <CirclePlus size={16} className="mr-2" />
            No disponible
          </Button>
        ) : (
          <Button className="w-full mt-1 bg-gray-app-300 text-white" disabled>
            No disponible
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
