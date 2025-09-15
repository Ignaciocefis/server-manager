import axios from "axios";
import { toast } from "sonner";
import { z } from "zod";
import { createServerFormSchema } from "@/features/server/shemas";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { handleApiError } from "@/lib/services/errors/errors";

export const submitServer = async (
  data: z.infer<typeof createServerFormSchema>,
  router: AppRouterInstance,
  closeDialog?: () => void
) => {
  await axios.post("/api/server/create", data)
    .then((res) => {
      toast.success(res.data.message || "Servidor creado correctamente");
      closeDialog?.();
      const newServerId = res.data.data.serverId;
      if (newServerId) {
        router.push(`/servers/${newServerId}`);
      }
    })
    .catch((error) => {
      handleApiError(error, true);
    });
};
