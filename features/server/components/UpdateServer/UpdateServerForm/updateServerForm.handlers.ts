import axios from "axios";
import { z } from "zod";
import { updateServerFormSchema } from "@/features/server/shemas";
import { toast } from "sonner";

export const updateServer = async (
  data: z.infer<typeof updateServerFormSchema>
) => {
  const updatedServer = await axios.put("/api/server/update", data)
    .then((res) => {
      if (!res.data.success) {
        console.error("Error updating server:", res.data.error);
        toast.error(res.data.error || "Error al actualizar el servidor");
      }
      return res.data.data;
    }).catch((error) => {
      console.error("Error updating server:", error);
      toast.error("Error al actualizar el servidor");
    });
  return updatedServer;
};
