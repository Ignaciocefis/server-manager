import axios from "axios";
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
    onSuccess();
  }).catch((error) => {
    handleApiError(error, true);
    onError?.(error);
  });
}
