import axios from "axios";
import { z } from "zod";
import { updateServerFormSchema } from "@/features/server/shemas";

export const updateServer = async (
  data: z.infer<typeof updateServerFormSchema>
) => {
  try {
    const response = await axios.put("/api/server/update", data);
    return response.data;
  } catch (error: unknown) {
    console.error("Error actualizando servidor:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.error || "Error desconocido");
    }
    throw new Error("Error de red o inesperado");
  }
};
