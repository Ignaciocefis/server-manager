import axios from "axios";
import { toast } from "sonner";
import { CreateUserFormData } from "./CreateUserForm.types";
import { handleApiError } from "@/lib/services/errors/errors";

export async function handleCreateUser(
  data: CreateUserFormData,
  onSuccess?: () => void,
  closeDialog?: () => void
) {
  await axios.post("/api/user/create", data)
    .then(() => {
      closeDialog?.();
      onSuccess?.();
      toast.success("Usuario creado correctamente");
    })
    .catch((error) => {
      handleApiError(error, true);
    });
}
