import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateServerFormSchema } from "@/features/server/shemas";
import { ServerListItem } from "@/features/server/types";

export const useUpdateServerFormSchema = (server: ServerListItem) => {
  return useForm<z.infer<typeof updateServerFormSchema>>({
    resolver: zodResolver(updateServerFormSchema),
    defaultValues: {
      serverId: server.id,
      name: server.name,
      ramGB: server.ramGB,
      diskCount: server.diskCount,
      available: server.available,
      gpus:
        (server.gpus?.length ?? 0) > 0
          ? (server.gpus ?? []).map((gpu) => ({
              ...gpu,
              userId: gpu.userId ?? undefined,
            }))
          : [{ name: "", type: "", ramGB: 1, userId: undefined }],
    },
  });
};
