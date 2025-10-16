import { handleApiError } from "@/lib/services/errors/errors";
import axios from "axios";

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
  if (!serverIds || serverIds.length === 0) {
    const errorMessage = "You must assign at least one server";
    onError?.(errorMessage);
    return;
  }

  try {
    await axios.put("/api/server/assignServers", { userId, serverIds });
    onSuccess();
  } catch (error) {
    handleApiError(error, true);
    onError?.(error);
  }
}
