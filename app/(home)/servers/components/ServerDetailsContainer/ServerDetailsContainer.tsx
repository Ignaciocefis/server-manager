"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { ServerListItem } from "@/app/(home)/components/Server/ServerList/ServerList.types";
import { ServerDetailsInfo } from "../ServerDetailsInfo";
import { GpuDonutChart } from "@/components/Shared/Server";

export const ServerDetailsContainer = () => {
  const params = useParams();
  const serverId = params.id as string;
  const router = useRouter();

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

      toast.success(
        `Servidor ${response.data.updatedServer.available ? "disponible" : "en mantenimiento"}`
      );

      setServer(response.data.updatedServer);
    } catch (error) {
      console.error("Error cambiando disponibilidad:", error);
      setError("No se pudo cambiar el estado del servidor.");
    }
  };

  const handleDeleteServer = async () => {
    try {
      if (!isAdmin) {
        setError("Solo los administradores pueden eliminar servidores.");
        return;
      }

      await axios.delete("/api/server/delete", {
        data: { serverId },
      });

      toast.success("Servidor eliminado correctamente");
      router.push("/");
    } catch (err) {
      console.error("Error eliminando servidor:", err);
      setError("No se pudo eliminar el servidor.");
    }
  };

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
  return (
    <>
      <ServerDetailsInfo
        server={server}
        isAdmin={isAdmin}
        onUpdate={handleServerUpdate}
        onToggleAvailability={toggleAvailability}
        onDelete={handleDeleteServer}
      />

      <div className="flex flex-col items-center mt-8">
        <GpuDonutChart
          installedGpus={server.installedGpus}
          availableGpus={server.availableGpus}
          size="md"
        />
      </div>
    </>
  );
};
