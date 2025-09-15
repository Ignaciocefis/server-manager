import axios from "axios";
import { toast } from "sonner";
import { AssignResearcherPopoverHandlers } from "./AssignResearcherDialog.types";
import { handleApiError } from "@/lib/services/errors/errors";

export async function assignResearcher({
  userId,
  researcherId,
  onSuccess,
  onError,
}: AssignResearcherPopoverHandlers) {
  await axios.put("/api/user/assignResearcher", {
    userId,
    researcherId,
  }).then(() => {
    toast.success("Investigador asignado correctamente");
    onSuccess();
  }).catch((error) => {
    handleApiError(error, true);
    onError?.(error);
  });
}
