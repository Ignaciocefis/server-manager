import axios from "axios";
import { toast } from "sonner";
import { UserSummary } from "@/features/user/types";
import { handleApiError } from "@/lib/services/errors/errors";

export async function handleProfileUpdate(
  data: UserSummary,
  onSuccess: (user: UserSummary) => void
) {
  await axios.put("/api/user/update/profile", data)
    .then(() => {
    }).catch((error) => {
      handleApiError(error, true);
    });

  await axios.get("/api/auth/me")
    .then((res) => {
      const updatedUser = res.data.data;

      toast.success("Perfil actualizado correctamente");
      onSuccess(updatedUser);
    }).catch((error) => {
      handleApiError(error, true);
    });
}
