import { EventType, Prisma } from "@prisma/client";

export interface EventLog {
  id: string;
  userId: string | null;
  serverId: string | null;
  gpuId: string | null;
  eventType: EventType;
  message: string;
}
export interface LogsTableDataProps {
  id: string;
  createdAt: string;
  userFullName: string | null;
  server?: {
    name: string;
  } | null;
  reservation?: {
    gpu?: {
      name: string;
    } | null;
  } | null;
  eventType: EventType;
  message: string;
};

export interface GetLogsParams {
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: "asc" | "desc";
  filterTitle?: string;
  typeFilter?: string;
}

export type EventLogWithRelations = Prisma.EventLogGetPayload<{
  include: {
    user: { select: { name: true; firstSurname: true; secondSurname: true } };
    server: { select: { name: true } };
    reservation: { select: { gpu: { select: { name: true } } } };
  };
}>;