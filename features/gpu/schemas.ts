import z from "zod";

export const gpuReservationFormSchema = z.object({
  serverId: z.string().min(1, "El ID del servidor es obligatorio"),
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
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora de inicio inválida"),
  endHour: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Hora de fin inválida"),
  selectedGpuIds: z
    .array(z.string())
    .min(1, "Debes seleccionar al menos una GPU"),
});