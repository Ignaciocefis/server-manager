import { EventType, Prisma } from "@prisma/client";
import { EventLogWithRelations, GetLogsParams, LogsTableDataProps } from "./types";
import { getFullName } from "../user/utils";

export const TYPE_VARIANTS: Record<string, "success" | "warning" | "error" | "info"> = {
  USER_CREATED: "success",
  USER_UPDATED: "warning",
  USER_DELETED: "error",
  USER_DEACTIVATED: "error",
  USER_REACTIVATED: "success",
  USER_ASSIGNED_MENTOR: "success",
  USER_GRANTED_SERVER_ACCESS: "success",
  USER_REVOKED_SERVER_ACCESS: "error",
  SERVER_CREATED: "success",
  SERVER_UPDATED: "warning",
  SERVER_DELETED: "error",
  SERVER_AVAILABLE: "success",
  SERVER_UNAVAILABLE: "error",
  RESERVATION_CREATED: "info",
  RESERVATION_AVAILABLE: "info",
  RESERVATION_EXTENDED: "info",
  RESERVATION_COMPLETED: "success",
  RESERVATION_CANCELLED: "error",
};

export const TYPE_TRANSLATIONS: Record<string, string> = {
  USER_CREATED: "Usuario creado",
  USER_UPDATED: "Usuario actualizado",
  USER_DELETED: "Usuario eliminado",
  USER_DEACTIVATED: "Usuario desactivado",
  USER_REACTIVATED: "Usuario reactivado",
  USER_ASSIGNED_MENTOR: "Usuario asignado a mentor",
  USER_GRANTED_SERVER_ACCESS: "Acceso a servidor concedido",
  USER_REVOKED_SERVER_ACCESS: "Acceso a servidor revocado",
  SERVER_CREATED: "Servidor creado",
  SERVER_UPDATED: "Servidor actualizado",
  SERVER_DELETED: "Servidor eliminado",
  SERVER_AVAILABLE: "Servidor disponible",
  SERVER_UNAVAILABLE: "Servidor no disponible",
  RESERVATION_CREATED: "Reserva creada",
  RESERVATION_AVAILABLE: "Reserva disponible",
  RESERVATION_EXTENDED: "Reserva extendida",
  RESERVATION_COMPLETED: "Reserva completada",
  RESERVATION_CANCELLED: "Reserva cancelada",
};

export const getPaginationAndSort = (params?: GetLogsParams) => {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const skip = (page - 1) * limit;
  const sortField = params?.sortField ?? "createdAt";
  const sortOrder = params?.sortOrder ?? "desc";
  const filterTitle = params?.filterTitle ?? "";
  const typeFilter = params?.typeFilter ?? "all";

  return { page, limit, skip, sortField, sortOrder, filterTitle, typeFilter };
}

export const buildOrFilters = (filterTitle: string) => {
  return [
    { message: { contains: filterTitle, mode: Prisma.QueryMode.insensitive } },
    { message: { contains: filterTitle, mode: Prisma.QueryMode.insensitive } },
    EventType[filterTitle as keyof typeof EventType]
      ? { eventType: filterTitle as EventType }
      : {},
    {
      user: {
        OR: [
          { name: { contains: filterTitle, mode: Prisma.QueryMode.insensitive } },
          { firstSurname: { contains: filterTitle, mode: Prisma.QueryMode.insensitive } },
          { secondSurname: { contains: filterTitle, mode: Prisma.QueryMode.insensitive } },
        ],
      },
    },
    { server: { name: { contains: filterTitle, mode: Prisma.QueryMode.insensitive } } },
    {
      reservation: {
        gpu: { name: { contains: filterTitle, mode: Prisma.QueryMode.insensitive } },
      },
    },
  ];
}

export const buildOrderBy = (sortField: string, sortOrder: "asc" | "desc") => {
  switch (sortField) {
    case "userFullName":
      return { user: { firstSurname: sortOrder } };
    case "server.name":
      return { server: { name: sortOrder } };
    case "reservation.gpu.name":
      return { reservation: { gpu: { name: sortOrder } } };
    default:
      return { [sortField]: sortOrder };
  }
}

export const formatLogs = (
  logs: EventLogWithRelations[]
): LogsTableDataProps[] => {
  return logs.map((log) => ({
    id: log.id,
    createdAt: new Date(log.createdAt.toISOString()).toLocaleString(),
    userFullName: log.user
      ? getFullName(
        log.user.firstSurname ?? undefined,
        log.user.secondSurname ?? undefined,
        log.user.name ?? undefined,
      )
      : null,
    server: log.server ? { name: log.server.name } : null,
    reservation: log.reservation
      ? { gpu: log.reservation.gpu ? { name: log.reservation.gpu.name } : null }
      : null,
    eventType: log.eventType,
    message: log.message,
  }));
}