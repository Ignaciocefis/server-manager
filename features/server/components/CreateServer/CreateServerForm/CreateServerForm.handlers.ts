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
  try {
    const response = await axios.post("/api/server/create", data);
    toast.success(response.data.message || "Servidor creado correctamente");

    closeDialog?.();

    const newServerId = response.data.server?.id;
    if (newServerId) {
      router.push(`/servers/${newServerId}`);
    }
  } catch (error: unknown) {
    console.error({ error });

    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.error || "Error desconocido";
      toast.error(errorMessage);
    } else {
      toast.error("Error de red o inesperado");
    }
  }
};
