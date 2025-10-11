import { db } from "@/lib/db";
import { ApiResponse } from "@/lib/types/BDResponse.types";
import { EventLog, GetLogsParams, LogsTableDataProps, UnreadNotification } from "./types";
import { EventType, Prisma } from "@prisma/client";
import { eventFormSchema } from "./schemas";
import z from "zod";
import { buildOrderBy, buildOrFilters, formatLogs, getPaginationAndSort } from "./helpers";

export const createEventLog = async (data: z.infer<typeof eventFormSchema>): Promise<ApiResponse<EventLog | null>> => {
  try {
    const eventLog = await db.eventLog.create({
      data: {
        userId: data.userId ?? null,
        serverId: data.serverId ?? null,
        reservationId: data.reservationId ?? null,
        eventType: data.eventType,
        message: data.message,
      }, select: {
        id: true,
      }
    });

    if (data.userId) {
      await db.userNotification.create({
        data: {
          userId: data.userId,
          eventLogId: eventLog.id,
          isRead: false,
        }
      });
    } else {
      const accessibleUsers = await db.userServerAccess.findMany({
        where: { serverId: data.serverId },
        select: { userId: true },
      });

      await Promise.all(
        accessibleUsers.map((user) =>
          db.userNotification.create({
            data: {
              userId: user.userId,
              eventLogId: eventLog.id,
              isRead: false,
            },
          })
        )
      );
    }

    return { success: true, data: null, error: null };
  } catch (err) {
    console.error("Error creating EventLog:", err);
    return { success: false, data: null, error: "Error creating EventLog" };
  }
};

export const getAllLogs = async (
  params?: GetLogsParams,
  serverId?: string,
): Promise<ApiResponse<{ rows: LogsTableDataProps[]; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean }>> => {
  try {
    const { page, limit, skip, sortField, sortOrder, filterTitle, typeFilter } = getPaginationAndSort(params);
    const orFilters = buildOrFilters(filterTitle);

    const andFilters: object[] = [];
    if (typeFilter !== "all" && EventType[typeFilter as keyof typeof EventType]) {
      andFilters.push({ eventType: typeFilter as EventType });
    }
    if (serverId) {
      andFilters.push({ serverId });
    }

    const orderBy = buildOrderBy(sortField, sortOrder);

    const [logs, total] = await Promise.all([
      db.eventLog.findMany({
        where: {
          ...(andFilters.length > 0 ? { AND: andFilters } : {}),
          OR: orFilters,
        },
        orderBy,
        skip,
        take: limit,
        include: {
          user: { select: { name: true, firstSurname: true, secondSurname: true } },
          server: { select: { name: true } },
          reservation: { select: { gpu: { select: { name: true } } } },
        },
      }),
      db.eventLog.count({
        where: {
          ...(andFilters.length > 0 ? { AND: andFilters } : {}),
          OR: orFilters,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        rows: formatLogs(logs),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error en getAllLogs:", error);
    return { success: false, data: null, error: "Error al obtener logs" };
  }
};

export const getAccessibleLogs = async (
  userId: string,
  serverId?: string,
  params?: GetLogsParams,
): Promise<ApiResponse<{ rows: LogsTableDataProps[]; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean }>> => {
  try {
    const { page, limit, skip, sortField, sortOrder, filterTitle, typeFilter } = getPaginationAndSort(params);
    const orFilters = buildOrFilters(filterTitle);

    let serverIds: string[] = [];
    if (!serverId) {
      const accessibleServers = await db.userServerAccess.findMany({
        where: { userId },
        select: { serverId: true },
      });
      serverIds = accessibleServers.map((s) => s.serverId);
    }

    const andFilters: object[] = [];
    if (typeFilter !== "all" && EventType[typeFilter as keyof typeof EventType]) {
      andFilters.push({ eventType: typeFilter as EventType });
    }

    const whereConditions: Prisma.EventLogWhereInput = {
      ...(andFilters.length > 0 ? { AND: andFilters } : {}),
    };

    if (serverId) {
      whereConditions.serverId = serverId;
    } else {
      whereConditions.OR = [
        { userId },
        ...(serverIds.length > 0 ? [{ serverId: { in: serverIds } }] : []),
      ];
    }

    if (filterTitle) {
      whereConditions.AND = [
        ...((Array.isArray(whereConditions.AND) ? whereConditions.AND : [])),
        { OR: orFilters },
      ];
    }

    const orderBy = buildOrderBy(sortField, sortOrder);

    const [logs, total] = await Promise.all([
      db.eventLog.findMany({
        where: whereConditions,
        orderBy,
        skip,
        take: limit,
        include: {
          user: { select: { name: true, firstSurname: true, secondSurname: true } },
          server: { select: { name: true } },
          reservation: { select: { gpu: { select: { name: true } } } },
        },
      }),
      db.eventLog.count({ where: whereConditions }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data: {
        rows: formatLogs(logs),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error en getAccessibleLogs:", error);
    return { success: false, data: null, error: "Error al obtener logs accesibles" };
  }
};

export const getAllUnreadNotifications = async (userId: string): Promise<ApiResponse<UnreadNotification[] | null>> => {
  try {
    const notifications = await db.userNotification.findMany({
      where: { userId, isRead: false },
      select: {
        id: true,
        createdAt: true,
        eventLog: {
          select: {
            message: true,
            eventType: true,
          },
        },
        isRead: true,
      },
    });

    const mappedNotifications = notifications.map(n => ({
      id: n.id,
      createdAt: n.createdAt,
      eventType: n.eventLog.eventType,
      message: n.eventLog.message,
      isRead: n.isRead,
    }));

    return { success: true, data: mappedNotifications, error: null };
  } catch (error) {
    console.error("Error al obtener notificaciones no leídas:", error);
    return { success: false, data: null, error: "Error al obtener notificaciones no leídas" };
  }
};

export const markNotificationAsRead = async (
  userNotificationId: string,
  userId: string
): Promise<ApiResponse<null>> => {
  try {
    if (userNotificationId === "all") {
      await db.userNotification.deleteMany({
        where: { userId },
      });
    } else {
      await db.userNotification.delete({
        where: { id: userNotificationId, userId },
      });
    }

    return { success: true, data: null, error: null };
  } catch (error) {
    console.error("Error al eliminar notificación:", error);
    return {
      success: false,
      data: null,
      error: "Error al eliminar notificación",
    };
  }
};
