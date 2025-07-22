import axios from "axios";
import { toast } from "sonner";
import { ServerSummary } from "@/features/server/types";

export async function fetchServers(editorId: string, userId: string) {
  let servers: ServerSummary[] = [];
  let selectedIds: string[] = [];

  await Promise.all([
    axios.get(`/api/server/list?id=${editorId}`),
    axios.get(`/api/server/list?id=${userId}`),
  ])
    .then(([availableRes, assignedRes]) => {
      if (!availableRes.data.success || !assignedRes.data.success) {
        const errorMsg =
          availableRes.data.error ||
          assignedRes.data.error ||
          "No se pudieron obtener los servidores";
        toast.error(errorMsg);
        return;
      }

      servers = availableRes.data.data ?? [];
      selectedIds = (assignedRes.data.data ?? []).map((s: ServerSummary) => s.id);
    })
    .catch((error) => {
      toast.error("No se pudieron obtener los servidores");
      console.error("Error al obtener servidores:", error);
    });

  return { servers, selectedIds };
}
