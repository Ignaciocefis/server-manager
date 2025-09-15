import axios from "axios";
import { ServerSummary } from "@/features/server/types";
import { handleApiError } from "@/lib/services/errors/errors";

export async function fetchServers(editorId: string, userId: string) {
  let servers: ServerSummary[] = [];
  let selectedIds: string[] = [];

  await Promise.all([
    axios.get(`/api/server/list?id=${editorId}`),
    axios.get(`/api/server/list?id=${userId}`),
  ])
    .then(([availableRes, assignedRes]) => {
      servers = availableRes.data.data ?? [];
      const assignedData = Array.isArray(assignedRes.data.data) ? assignedRes.data.data : [];
      selectedIds = assignedData.map((s: ServerSummary) => s.id);

    })
    .catch((error) => {
      handleApiError(error, true);
    });

  return { servers, selectedIds };
}
