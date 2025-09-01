import axios from "axios";
import { toast } from "sonner";

export async function assignServers({
  userId,
  serverIds,
  onSuccess,
  onError,
}: {
  userId: string;
  serverIds: string[];
  onSuccess: () => void;
  onError?: (error: unknown) => void;
}) {
  await axios.put("/api/server/assignServers", { userId, serverIds })
    .then((res) => {
      if (!res.data.success) {
        toast.error(res.data.error || "No se pudo asignar los servidores");
        onError?.(new Error(res.data.error || "Error al asignar servidores"));
        return;
      }
      toast.success("Servidores asignados correctamente");
      onSuccess();
    })
    .catch((error) => {
      toast.error("No se pudo asignar los servidores");
      console.error("Error al asignar servidores:", error);
      onError?.(error);
    });
}
