import { handleApiError } from "@/lib/services/errors/errors";
import axios from "axios";
import { toast } from "sonner";

export async function handleCancelReservation(
  reservationId: string,
  onSuccess?: () => void
) {
  await axios.put("/api/gpu/cancelation", { reservationId }).then(() => {
    toast.success("Reserva cancelada exitosamente");
    onSuccess?.();
  }).catch((error) => {
    handleApiError(error, true);
  });
}
