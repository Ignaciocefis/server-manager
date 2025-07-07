import z from "zod";

export const assignResearcherFormSchema = z.object({
  userId: z.string().min(1, "El ID del junior es requerido"),
  researcherId: z.string().min(1, "El ID del investigador es requerido"),
});
