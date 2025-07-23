import axios from "axios";
import { addHours } from "date-fns";
import { toast } from "sonner";

export async function handleExtendReservation(
  reservationId: string,
  currentEndTime: Date,
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

  const extendedUntil = addHours(currentEndTime, hoursToExtend);

  await axios.put("/api/gpu/extend", {
    reservationId,
    extendedUntil: extendedUntil.toISOString(),
  }).then((res) => {
    if (!res.data.success) {
      throw new Error(res.data.message || "Error al extender la reserva");
    }

    toast.success(`Reserva extendida ${hoursToExtend} hora(s) correctamente`);
    setShowPopover(false);
    onSuccess();
  }).catch((err) => {
    console.error("Error al extender reserva:", err);
    setError("No se pudo extender la reserva");
    toast.error("No se pudo extender la reserva");
  }).finally(() => {
    setLoading(false);
  });
}
