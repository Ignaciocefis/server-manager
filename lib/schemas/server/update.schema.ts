import { z } from "zod";

export const updateServerFormSchema = z.object({
  serverId: z
    .string()
    .min(1, "El ID del servidor es requerido"),
  name: z
    .string()
    .min(3, "El nombre del servidor debe tener al menos 3 caracteres")
    .max(100, "El nombre del servidor no puede superar los 100 caracteres"),
  ramGB: z
    .coerce.number({ invalid_type_error: "La RAM debe ser un número" })
    .int("La RAM debe ser un número entero")
    .min(1, "Debe tener al menos 1 GB de RAM"),
  diskCount: z
    .coerce.number({ invalid_type_error: "La cantidad de discos debe ser un número" })
    .int("Debe ser un número entero")
    .min(1, "Debe tener al menos un disco"),
  available: z.boolean(),
});