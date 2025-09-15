import { useEffect, useState } from "react";
import { fetchServers } from "./handlers/fetchServers";
import { ServerSummary } from "@/features/server/types";
import { handleApiError } from "@/lib/services/errors/errors";

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
        handleApiError(error, true);
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
