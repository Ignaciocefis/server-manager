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
  }).then((res) => {
    if (!res.data.success) {
      toast.error(res.data.error || "No se pudo eliminar el servidor.");
      setError(res.data.error || "No se pudo eliminar el servidor.");
      return;
    }
    toast.success("Servidor eliminado correctamente");
    router.push("/");
  }).catch((err) => {
    toast.error("No se pudo eliminar el servidor.");
    console.error("Error eliminando servidor:", err);
    setError("No se pudo eliminar el servidor.");
  });
};
