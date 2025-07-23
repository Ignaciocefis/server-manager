import { SubmitHandler, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { updateServerFormSchema } from "@/features/server/shemas";
import { toast } from "sonner";
import { UpdateServerFormProps } from "../UpdateServerForm.types";
import { updateServer } from "../updateServerForm.handlers";

type Props = Pick<UpdateServerFormProps, "onUpdate" | "closeDialog"> & {
  form: UseFormReturn<z.infer<typeof updateServerFormSchema>>;
};

export const useUpdateServerForm = ({
  closeDialog,
  onUpdate,
}: Props) => {
  const onSubmit: SubmitHandler<z.infer<typeof updateServerFormSchema>> = async (
    data
  ) => {
    try {
      const response = await updateServer(data);
      toast.success(response.message || "Servidor actualizado correctamente");

      if (response.server && onUpdate) {
        onUpdate(response.server);
      }

      closeDialog?.();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al actualizar el servidor";
      toast.error(errorMessage);
    }
  };

  return { onSubmit };
};
