import { useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchServers } from "./handlers/fetchServers";
import { ServerSummary } from "@/features/server/types";

export function useServerAssignment(open: boolean, editorId: string, userId: string) {
  const [servers, setServers] = useState<ServerSummary[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      setLoading(true);
      try {
        const { servers, selectedIds } = await fetchServers(editorId, userId);
        setServers(servers);
        setSelected(selectedIds);
      } catch (error) {
        console.error("Error fetching servers:", error);
        toast.error("No se pudo cargar la lista de servidores");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, editorId, userId]);

  const toggleServer = (serverId: string) => {
    setSelected((prev) =>
      prev.includes(serverId)
        ? prev.filter((id) => id !== serverId)
        : [...prev, serverId]
    );
  };

  const filteredServers = servers.filter((server) =>
    server.name.toLowerCase().includes(search.toLowerCase())
  );

  return {
    selected,
    setSelected,
    search,
    setSearch,
    loading,
    filteredServers,
    toggleServer,
  };
}
