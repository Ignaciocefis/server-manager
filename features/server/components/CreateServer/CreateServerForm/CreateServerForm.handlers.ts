import axios from "axios";
import { toast } from "sonner";
import { z } from "zod";
import { createServerFormSchema } from "@/features/server/shemas";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const submitServer = async (
  data: z.infer<typeof createServerFormSchema>,
  router: AppRouterInstance,
  closeDialog?: () => void
) => {
  await axios.post("/api/server/create", data)
  .then((res) => {
    if(!res.data.success) {
      toast.error(res.data.message || "Error al crear el servidor");
      console.error("Error al crear el servidor:", res.data.message);
      return;
    }
    toast.success(res.data.message || "Servidor creado correctamente");
    closeDialog?.();
    const newServerId = res.data.server?.id;
    if (newServerId) {
      router.push(`/servers/${newServerId}`);
    }
  })
  .catch((error) => {
    console.error("Error al crear el servidor:", error);
    toast.error(
      error.response?.data?.error || "Error al crear el servidor"
    );
  });
};
