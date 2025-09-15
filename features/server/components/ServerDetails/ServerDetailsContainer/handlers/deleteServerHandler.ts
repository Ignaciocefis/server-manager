import { handleApiError } from "@/lib/services/errors/errors";
import axios from "axios";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "sonner";

export const handleDeleteServer = async (
  serverId: string,
  router: AppRouterInstance,
  setError: (msg: string) => void
) => {
  await axios.delete("/api/server/delete", {
    data: { serverId },
  }).then(() => {
    toast.success("Servidor eliminado correctamente");
    router.push("/");
  }).catch((err) => {
    const msg = handleApiError(err, false);
    setError(msg);
  });
};
