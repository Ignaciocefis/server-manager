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

export const updateServerFormSchema = (t: (key: string) => string) => z.object({
  serverId: z
    .string()
    .min(1, t("Server.Schemas.serverIdRequired")),
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
  available: z.boolean(),
  gpus: z
    .array(z.object({
      id: z.string().optional(),
      name: z.string().min(1, t("Server.Schemas.gpuNameMin")),
      type: z.string().min(1, t("Server.Schemas.gpuTypeMin")),
      status: z.enum(["PENDING", "ACTIVE", "EXTENDED", "COMPLETED", "CANCELLED"]).optional(),
      userId: z.string().optional(),
      ramGB: z
        .coerce.number({ invalid_type_error: t("Server.Schemas.gpuRamGBInvalid") })
        .int(t("Server.Schemas.gpuRamGBInt"))
        .min(1, t("Server.Schemas.gpuRamGBMin"))
    }))
    .min(1, t("Server.CreateServerForm.gpuMin"))
});