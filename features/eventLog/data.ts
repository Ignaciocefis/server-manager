import { db } from "@/lib/db";
import { ApiResponse } from "@/lib/types/BDResponse.types";
import { EventLog, GetLogsParams, LogsTableDataProps } from "./types";
import { getFullName } from "../user/utils";
import { EventType, Prisma } from "@prisma/client";
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

export const getAllLogs = async (
  params?: GetLogsParams,
  serverId?: string,
): Promise<ApiResponse<{ rows: LogsTableDataProps[]; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean }>> => {
  try {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const skip = (page - 1) * limit;
    const sortField = params?.sortField ?? "createdAt";
    const sortOrder = params?.sortOrder ?? "desc";
    const filterTitle = params?.filterTitle ?? "";
    const typeFilter = params?.typeFilter ?? "all";

    const orFilters = [
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
      {
        server: {
          name: { contains: filterTitle, mode: Prisma.QueryMode.insensitive },
        },
      },
      {
        reservation: {
          gpu: {
            name: { contains: filterTitle, mode: Prisma.QueryMode.insensitive },
          },
        },
      },
    ];

    const andFilters: object[] = [];
    if (typeFilter !== "all" && EventType[typeFilter as keyof typeof EventType]) {
      andFilters.push({ eventType: typeFilter as EventType });
    }
    if (serverId) {
      andFilters.push({ serverId });
    }

    let orderBy: Prisma.EventLogOrderByWithRelationInput;
    switch (sortField) {
      case "userFullName":
        orderBy = { user: { firstSurname: sortOrder } };
        break;
      case "server.name":
        orderBy = { server: { name: sortOrder } };
        break;
      case "reservation.gpu.name":
        orderBy = { reservation: { gpu: { name: sortOrder } } };
        break;
      default:
        orderBy = { [sortField]: sortOrder };
        break;
    }

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
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const formattedLogs = logs.map((log) => ({
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

    return {
      success: true,
      data: { rows: formattedLogs, total, totalPages, hasNext, hasPrev },
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
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const skip = (page - 1) * limit;
    const sortField = params?.sortField ?? "createdAt";
    const sortOrder = params?.sortOrder ?? "desc";
    const filterTitle = params?.filterTitle ?? "";
    const typeFilter = params?.typeFilter ?? "all";

    let serverIds: string[] = [];
    if (!serverId) {
      const accessibleServers = await db.userServerAccess.findMany({
        where: { userId },
        select: { serverId: true },
      });
      serverIds = accessibleServers.map((s) => s.serverId);
    }

    const orFilters = [
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
      {
        server: {
          name: { contains: filterTitle, mode: Prisma.QueryMode.insensitive },
        },
      },
      {
        reservation: {
          gpu: {
            name: { contains: filterTitle, mode: Prisma.QueryMode.insensitive },
          },
        },
      },
    ];

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

    let orderBy: Prisma.EventLogOrderByWithRelationInput = { createdAt: sortOrder };
    switch (sortField) {
      case "userFullName":
        orderBy = { user: { firstSurname: sortOrder } };
        break;
      case "server.name":
        orderBy = { server: { name: sortOrder } };
        break;
      case "reservation.gpu.name":
        orderBy = { reservation: { gpu: { name: sortOrder } } };
        break;
      default:
        orderBy = { [sortField]: sortOrder };
        break;
    }

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
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const formattedLogs = logs.map((log) => ({
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

    return {
      success: true,
      data: {
        rows: formattedLogs,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error en getAccessibleLogs:", error);
    return { success: false, data: null, error: "Error al obtener logs accesibles" };
  }
};
