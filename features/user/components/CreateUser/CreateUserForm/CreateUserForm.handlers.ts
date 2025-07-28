import axios from "axios";
import { toast } from "sonner";
import { CreateUserFormData } from "./CreateUserForm.types";

export async function handleCreateUser(
  data: CreateUserFormData,
  onSuccess?: () => void,
  closeDialog?: () => void
) {
  await axios.post("/api/user/create", data)
    .then((res) => {
      if (!res.data.success) {
        toast.error(res.data.error || "Error al crear usuario");
        return;
      }

      closeDialog?.();
      onSuccess?.();
      toast.success("Usuario creado correctamente");
    })
    .catch((error) => {
      console.error("Error al crear usuario:", error);
      toast.error(error.response?.data.error || "Error al crear usuario");
    });
}
