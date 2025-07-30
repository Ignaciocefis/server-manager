import axios from "axios";
import { addHours } from "date-fns";
import { toast } from "sonner";

export async function handleExtendReservation(
  reservationId: string,
  currentendDate: Date,
  hoursToExtend: number,
  onSuccess: () => void,
  setLoading: (value: boolean) => void,
  setError: (value: string | null) => void,
  setShowPopover: (value: boolean) => void
) {
  if (hoursToExtend < 1 || hoursToExtend > 12) {
    setError("El número de horas debe estar entre 1 y 12.");
    return;
  }

  setLoading(true);
  setError(null);

  const extendedUntil = addHours(currentendDate, hoursToExtend);

  await axios.put("/api/gpu/extend", {
    reservationId,
    extendedUntil: extendedUntil.toISOString(),
  }).then((res) => {
    if (!res.data.success) {
      toast.error(res.data.error || "Error al extender la reserva");
      return;
    }

    toast.success(`Reserva extendida ${hoursToExtend} hora(s) correctamente`);
    setShowPopover(false);
    onSuccess();
  }).catch((error) => {
    console.error("Error al extender reserva:", error);
    setError(error || "No se pudo extender la reserva");
    toast.error(error?.response?.data?.error || "No se pudo extender la reserva");
  }).finally(() => {
    setLoading(false);
  });
}
