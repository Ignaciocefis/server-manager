import { handleApiError } from "@/lib/services/errors/errors";
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
    .then(() => {
      toast.success("Servidores asignados correctamente");
      onSuccess();
    })
    .catch((error) => {
      handleApiError(error, true);
      onError?.(error);
    });
}
