import { z } from "zod";

export const updateServerFormSchema = z.object({
  name: z.string().min(1),
  ramGB: z.number().int().nonnegative(),
  diskCount: z.number().int().nonnegative(),
  available: z.boolean(),
});