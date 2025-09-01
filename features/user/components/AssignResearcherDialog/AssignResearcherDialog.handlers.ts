import axios from "axios";
import { toast } from "sonner";
import { AssignResearcherPopoverHandlers } from "./AssignResearcherDialog.types";

export async function assignResearcher({
  userId,
  researcherId,
  onSuccess,
  onError,
}: AssignResearcherPopoverHandlers) {
  await axios.put("/api/user/assignResearcher", {
    userId,
    researcherId,
  }).then((res) => {
    if (!res.data.success) {
      toast.error("No se pudo asignar el investigador");
      onError?.("No se pudo asignar el investigador");
    }
    toast.success("Investigador asignado correctamente");
    onSuccess();
  }).catch((error) => {
    console.error("Error al asignar investigador:", error);
    onError?.(error);
    toast.error("No se pudo cambiar el estado del investigador.");
  });
}
