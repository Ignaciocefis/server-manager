import { EventType } from "@prisma/client";

export interface EventLog {
  id: string;
  userId: string | null;
  serverId: string | null;
  gpuId: string | null;
  eventType: EventType;
  message: string;
}
