import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cpu, Gpu, Info, Plus, Link2, CirclePlus } from "lucide-react";
import { ServerListItem } from "@/app/(home)/components/Server/ServerList/ServerList.types";
import Link from "next/link";

export default function ServerCard({ server }: { server: ServerListItem }) {
  return (
    <Card className="bg-gray-app-500 text-gray-app-100 rounded-xl p-4 w-[200px]">
      <CardContent className="flex flex-col gap-2 items-start p-0">
        <div className="flex justify-between w-full items-center">
          <h2 className="text-xl font-bold">{server.name}</h2>
          <Link2 size={18} />
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-app-100">
          <Cpu size={16} />
          <span>RAM: {server.ramGB} GB</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-app-100">
          <Gpu size={16} />
          <span>Gráficas instaladas: {server.tarjetasInstaladas ?? 0}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-app-100">
          <Plus size={16} />
          <span>Gráficas disponibles: {server.tarjetasDisponibles ?? 0}</span>
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

        {server.available && (server.tarjetasDisponibles ?? 0) > 0 ? (
          <Button className="w-full mt-1 bg-green-app-500-transparent hover:bg-green-app-500 text-gray-app-100">
            <CirclePlus size={16} className="mr-2" />
            Solicitar uso
          </Button>
        ) : server.available && (server.tarjetasDisponibles ?? 0) === 0 ? (
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
