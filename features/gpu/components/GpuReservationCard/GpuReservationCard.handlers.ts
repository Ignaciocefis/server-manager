import axios from "axios";
import { toast } from "sonner";

export async function handleCancelReservation(
  reservationId: string,
  onSuccess?: () => void
) {
  await axios.put("/api/gpu/cancelation", { reservationId }).then((res) => {
    if (!res.data.success) {
      toast.error("Error al cancelar la reserva");
      return;
    }
    toast.success("Reserva cancelada exitosamente");
    onSuccess?.();
  }).catch((error) => {
    console.error(error);
    toast.error(
      error.response?.data?.error ?? "Error inesperado al cancelar la reserva. Intenta nuevamente."
    );
  });
}
