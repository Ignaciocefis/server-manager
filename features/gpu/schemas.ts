import z from "zod";

export const gpuReservationFormSchema = (t: (key: string) => string) => z.object({
  serverId: z.string().min(1, t("Gpu.Schemas.selectServer")),
  range: z.object({
    from: z.preprocess((val) => {
      if (typeof val === "string" || val instanceof Date) return new Date(val);
    }, z.date()),
    to: z.preprocess((val) => {
      if (typeof val === "string" || val instanceof Date) return new Date(val);
    }, z.date()),
  }),
  startHour: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, t("Gpu.Schemas.invalidStartHour")),
  endHour: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, t("Gpu.Schemas.invalidEndHour")),
  selectedGpuIds: z
    .array(z.string())
    .min(1, t("Gpu.Schemas.selectGpu")),
});