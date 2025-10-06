import { z } from "zod";

export const createServerFormSchema = (t: (key: string) => string) => z.object({
  name: z
    .string()
    .min(3, t("Server.Schemas.nameMin"))
    .max(100, t("Server.Schemas.nameMax")),
  ramGB: z
    .coerce.number({ invalid_type_error: t("Server.Schemas.ramGBInvalid") })
    .int(t("Server.Schemas.ramGBInt"))
    .min(1, t("Server.Schemas.ramGBMin")),
  diskCount: z
    .coerce.number({ invalid_type_error: t("Server.Schemas.diskCountInvalid") })
    .int(t("Server.Schemas.diskCountInt"))
    .min(1, t("Server.Schemas.diskCountMin")),
  gpus: z
    .array(z.object({
      id: z.string().optional(),
      name: z.string().min(1, t("Server.Schemas.gpuNameMin")),
      type: z.string().min(1, t("Server.Schemas.gpuTypeMin")),
      ramGB: z
        .coerce.number({ invalid_type_error: t("Server.Schemas.gpuRamGBInvalid") })
        .int(t("Server.Schemas.gpuRamGBInt"))
        .min(1, t("Server.Schemas.gpuRamGBMin"))
    }))
    .min(1, t("Server.CreateServerForm.gpuMin"))
});

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
  gpus: z
    .array(z.object({
      id: z.string().optional(),
      name: z.string().min(1, "El nombre de la GPU es obligatorio"),
      type: z.string().min(1, "El tipo de GPU es obligatorio"),
      status: z.enum(["PENDING", "ACTIVE", "EXTENDED", "COMPLETED", "CANCELLED"]).optional(),
      userId: z.string().optional(),
      ramGB: z
        .coerce.number({ invalid_type_error: "La RAM de la GPU debe ser un número" })
        .int("La RAM de la GPU debe ser un número entero")
        .min(1, "La GPU debe tener al menos 1 GB de RAM")
    }))
    .min(1, "Debe haber al menos una GPU")
});