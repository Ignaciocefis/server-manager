"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { CirclePlus, ServerCog, ServerOff } from "lucide-react";
import { UpdateServerDialog } from "../../components";
import { ServerListItem } from "../../components/Server/ServerList/ServerList.types";

export default function ServerDetails() {
  const params = useParams();
  const serverId = params.id as string;

  const [server, setServer] = useState<ServerListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!serverId) return;

    const fetchServer = async () => {
      try {
        const user = await axios.get("/api/auth/me");
        const userId = user.data?.user?.id;
        const userCategory = user.data?.user?.category;
        setIsAdmin(userCategory === "ADMIN");

        if (!userId) {
          setError("No se pudo identificar al usuario.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `/api/server/details?serverId=${serverId}`
        );
        setServer(response.data);
      } catch (err) {
        console.error("Error al obtener detalles del servidor:", err);
        setError("No se pudieron cargar los detalles del servidor.");
      } finally {
        setLoading(false);
      }
    };

    fetchServer();
  }, [serverId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-full min-h-[300px]">
        <p className="text-2xl">Cargando servidor...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-full min-h-[300px]">
        <p className="text-2xl text-red-500">{error}</p>
      </div>
    );

  if (!server)
    return (
      <div className="flex justify-center items-center h-full min-h-[300px]">
        <p className="text-2xl">Servidor no encontrado</p>
      </div>
    );

  const handleServerUpdate = (updatedServer: ServerListItem) => {
    setServer(updatedServer);
  };

  const toggleAvailability = async () => {
    try {
      if (!isAdmin) {
        setError("Solo los administradores pueden cambiar la disponibilidad.");
        return;
      }

      const response = await axios.put("/api/server/availability", {
        serverId,
      });

      setServer(response.data.updatedServer);
    } catch (error) {
      console.error("Error cambiando disponibilidad:", error);
      setError("No se pudo cambiar el estado del servidor.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="px-8 py-4 m-4 w-11/12 text-gray-app-100 bg-gray-app-600 rounded-lg">
        <h1 className="text-2xl font-bold mb-4">
          Detalles del servidor: {server.name}
        </h1>
        <p>RAM: {server.ramGB} GB</p>
        <p>Discos: {server.diskCount}</p>

        <div className="flex flex-col gap-2 mt-4 w-full max-w-xs">
          {server.available && (server.tarjetasDisponibles ?? 0) > 0 ? (
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
              <UpdateServerDialog
                serverToEdit={server}
                onUpdate={handleServerUpdate}
              />

              <Button
                className={`w-full flex items-center justify-center gap-2 ${
                  server.available
                    ? "bg-green-app-500-transparent hover:bg-green-app-500"
                    : "bg-red-app-500-transparent hover:bg-red-app-500"
                } text-white`}
                onClick={toggleAvailability}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
