import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateServerFormSchema } from "@/features/server/shemas";
import { ServerListItem } from "@/features/server/types";
import { useLanguage } from "@/hooks/useLanguage";

export const useUpdateServerFormSchema = (server: ServerListItem) => {

  const { t } = useLanguage();

  const schema = updateServerFormSchema(t);

  return useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
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
