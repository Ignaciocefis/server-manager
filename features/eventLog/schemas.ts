import { EventType } from "@prisma/client";
import z from "zod";

export const eventFormSchema = z.object({
  eventType: z.nativeEnum(EventType),
  message: z.string().min(2).max(1000),
  userId: z.string().optional(),
  serverId: z.string().optional(),
  reservationId: z.string().optional(),
});
