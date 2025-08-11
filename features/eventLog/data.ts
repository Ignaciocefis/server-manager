import { db } from "@/lib/db";
import { ApiResponse } from "@/lib/types/BDResponse.types";
import { EventLog } from "./types";
import { eventFormSchema } from "./schemas";
import z from "zod";

export const createEventLog = async (data: z.infer<typeof eventFormSchema>): Promise<ApiResponse<EventLog | null>> => {
  try {
    await db.eventLog.create({
      data: {
        userId: data.userId ?? null,
        serverId: data.serverId ?? null,
        reservationId: data.reservationId ?? null,
        eventType: data.eventType,
        message: data.message,
      }
    });
    return { success: true, data: null, error: null };
  } catch (err) {
    console.error("Error creating EventLog:", err);
    return { success: false, data: null, error: "Error creating EventLog" };
  }
};