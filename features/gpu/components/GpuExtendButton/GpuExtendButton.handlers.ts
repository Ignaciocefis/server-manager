import { handleApiError } from "@/lib/services/errors/errors";
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
  }).then(() => {
    toast.success(`Reserva extendida ${hoursToExtend} hora(s) correctamente`);
    setShowPopover(false);
    onSuccess();
  }).catch((error) => {
    const msg = handleApiError(error, false);
    setError(msg);
  }).finally(() => {
    setLoading(false);
  });
}
