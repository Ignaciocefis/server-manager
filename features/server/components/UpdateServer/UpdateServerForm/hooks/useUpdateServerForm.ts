import { z } from "zod";
import { useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { handleApiError } from "@/lib/services/errors/errors";
import { updateServerFormSchema } from "@/features/server/shemas";
import { UpdateServerFormProps } from "../UpdateServerForm.types";

type UpdateServerOptions = Pick<UpdateServerFormProps, "onUpdate" | "closeDialog">;

export const useUpdateServerForm = ({ onUpdate, closeDialog }: UpdateServerOptions) => {
  const update = useCallback(
    (data: z.infer<typeof updateServerFormSchema>) => {
      return axios
        .put("/api/server/update", data)
        .then((res) => {
          if (!res.data.success) {
            throw new Error(res.data.error || "Error al actualizar el servidor");
          }
          toast.success("Servidor actualizado correctamente");
          onUpdate?.(res.data.data);
          closeDialog?.();
          return res.data.data;
        })
        .catch((error) => {
          handleApiError(error, true);
          return null;
        });
    },
    [onUpdate, closeDialog]
  );

  return { update };
};
