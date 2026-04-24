import { db } from "@/lib/db";
import { getGpuAvailabilityStats } from "@/features/server/utils";
import { EventType, Prisma, ReservationStatus } from "@prisma/client";
import { subDays } from "date-fns";

export interface StatisticsStatusItem {
  status: ReservationStatus;
  count: number;
}

export interface StatisticsCategoryItem {
  category: string;
  count: number;
}

export interface StatisticsServerItem {
  id: string;
  name: string;
  ramGB: number;
  diskCount: number;
  available: boolean;
  installedGpus: number;
  availableGpus: number;
  activeReservations: number;
}

export interface StatisticsUserItem {
  id: string;
  name: string;
  firstSurname: string;
  secondSurname: string | null;
  category: string;
  isActive: boolean;
  reservations: number;
}

export interface StatisticsEventItem {
  id: string;
  createdAt: Date;
  eventType: EventType;
  message: string;
  userName: string | null;
  serverName: string | null;
}

export interface StatisticsOverview {
  scope: "global" | "accessible";
  totalServers: number;
  availableServers: number;
  totalGpus: number;
  activeReservations: number;
  pendingReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  usersByCategory: StatisticsCategoryItem[];
  reservationStatus: StatisticsStatusItem[];
  activitySeries: { date: string; count: number }[];
  topServers: StatisticsServerItem[];
  topUsers: StatisticsUserItem[];
  recentEvents: StatisticsEventItem[];
}

export interface StatisticsDateRange {
  startDate?: Date;
  endDate?: Date;
}

const activeReservationScope: Prisma.GpuReservationWhereInput = {
  status: { in: ["ACTIVE", "EXTENDED"] },
};

const buildDateFilter = (
  range?: StatisticsDateRange
): Prisma.DateTimeFilter | undefined => {
  if (!range?.startDate && !range?.endDate) return undefined;

  return {
    ...(range.startDate ? { gte: range.startDate } : {}),
    ...(range.endDate ? { lte: range.endDate } : {}),
  };
};

const buildReservationOverlapFilter = (
  range?: StatisticsDateRange
): Prisma.GpuReservationWhereInput | undefined => {
  if (!range?.startDate && !range?.endDate) return undefined;

  return {
    ...(range.startDate ? { actualEndDate: { gte: range.startDate } } : {}),
    ...(range.endDate ? { startDate: { lte: range.endDate } } : {}),
  };
};

const toDateKey = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split("T")[0];
};

export async function getStatisticsOverview(
  userId: string,
  isAdmin: boolean,
  range?: StatisticsDateRange
): Promise<StatisticsOverview> {
  const accessibleServerIds = isAdmin
    ? []
    : (
        await db.userServerAccess.findMany({
          where: { userId },
          select: { serverId: true },
        })
      ).map((access) => access.serverId);

  const serverWhere: Prisma.ServerWhereInput = isAdmin
    ? {}
    : { id: { in: accessibleServerIds } };

  const reservationWhere: Prisma.GpuReservationWhereInput = isAdmin
    ? {}
    : { serverId: { in: accessibleServerIds } };

  const eventWhere: Prisma.EventLogWhereInput = isAdmin
    ? {}
    : { OR: [{ userId }, { serverId: { in: accessibleServerIds } }] };

  const now = new Date();
  const recentWindow = subDays(now, 13);

  const effectiveStartDate = range?.startDate ?? (range?.endDate ? subDays(range.endDate, 13) : undefined);
  const effectiveEndDate = range?.endDate ?? (range?.startDate ? now : undefined);

  const reservationOverlapFilter = buildReservationOverlapFilter({
    startDate: effectiveStartDate,
    endDate: effectiveEndDate,
  });
  const eventDateFilter = buildDateFilter({
    startDate: effectiveStartDate,
    endDate: effectiveEndDate,
  });

  const userWhere: Prisma.UserWhereInput = isAdmin
    ? {}
    : { serverAccess: { some: { serverId: { in: accessibleServerIds } } } };

  const [servers, reservationGroups, categoryGroups, users, recentEvents, activityEvents] =
    await Promise.all([
      db.server.findMany({
        where: serverWhere,
        select: {
          id: true,
          name: true,
          ramGB: true,
          diskCount: true,
          available: true,
          gpus: {
            select: {
              id: true,
              name: true,
              type: true,
              ramGB: true,
              reservations: {
                where: {
                  ...activeReservationScope,
                  ...(reservationOverlapFilter ?? {}),
                },
                select: {
                  id: true,
                  userId: true,
                  status: true,
                },
              },
            },
          },
          reservations: {
            where: {
              ...activeReservationScope,
              ...(reservationOverlapFilter ?? {}),
            },
            select: { id: true },
          },
        },
      }),
      db.gpuReservation.groupBy({
        by: ["status"],
        where: {
          ...reservationWhere,
          ...(reservationOverlapFilter ?? {}),
        },
        _count: { status: true },
      }),
      db.user.groupBy({
        by: ["category"],
        where: userWhere,
        _count: { category: true },
      }),
      db.user.findMany({
        where: userWhere,
        select: {
          id: true,
          name: true,
          firstSurname: true,
          secondSurname: true,
          category: true,
          isActive: true,
          gpuReservations: {
            where: {
              ...reservationWhere,
              ...(reservationOverlapFilter ?? {}),
            },
            select: { id: true },
          },
        },
      }),
      db.eventLog.findMany({
        where: {
          ...eventWhere,
          ...(eventDateFilter ? { createdAt: eventDateFilter } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          createdAt: true,
          eventType: true,
          message: true,
          user: { select: { name: true, firstSurname: true } },
          server: { select: { name: true } },
        },
      }),
      db.eventLog.findMany({
        where: {
          ...eventWhere,
          createdAt: {
            ...(effectiveStartDate ? { gte: effectiveStartDate } : { gte: recentWindow }),
            ...(effectiveEndDate ? { lte: effectiveEndDate } : {}),
          },
        },
        select: { createdAt: true },
      }),
    ]);

  const reservationCounts = new Map<ReservationStatus, number>();
  for (const group of reservationGroups) {
    reservationCounts.set(group.status, group._count.status);
  }

  const usersByCategory: StatisticsCategoryItem[] = categoryGroups.map((group) => ({
    category: group.category,
    count: group._count.category,
  }));

  const activityMap = new Map<string, number>();
  for (const event of activityEvents) {
    const dateKey = toDateKey(event.createdAt);
    activityMap.set(dateKey, (activityMap.get(dateKey) ?? 0) + 1);
  }

  const seriesStart = effectiveStartDate ?? subDays(now, 13);
  const seriesEnd = effectiveEndDate ?? now;
  const dayCount = Math.max(
    1,
    Math.floor((seriesEnd.getTime() - seriesStart.getTime()) / (24 * 60 * 60 * 1000)) + 1
  );

  const activitySeries = Array.from({ length: dayCount }, (_, index) => {
    const date = subDays(seriesStart, -index);
    const key = toDateKey(date);
    return {
      date: key,
      count: activityMap.get(key) ?? 0,
    };
  });

  const topServers = servers
    .map((server) => {
      const { installedGpus, availableGpus } = getGpuAvailabilityStats(server.gpus);

      return {
        id: server.id,
        name: server.name,
        ramGB: server.ramGB,
        diskCount: server.diskCount,
        available: server.available,
        installedGpus,
        availableGpus,
        activeReservations: server.reservations.length,
      } satisfies StatisticsServerItem;
    })
    .sort((left, right) => right.activeReservations - left.activeReservations)
    .slice(0, 5);

  const topUsers = users
    .map((user) => ({
      id: user.id,
      name: user.name,
      firstSurname: user.firstSurname,
      secondSurname: user.secondSurname,
      category: user.category,
      isActive: user.isActive,
      reservations: user.gpuReservations.length,
    }))
    .sort((left, right) => right.reservations - left.reservations)
    .slice(0, 5);

  return {
    scope: isAdmin ? "global" : "accessible",
    totalServers: servers.length,
    availableServers: servers.filter((server) => server.available).length,
    totalGpus: servers.reduce((total, server) => total + server.gpus.length, 0),
    activeReservations:
      (reservationCounts.get("ACTIVE") ?? 0) + (reservationCounts.get("EXTENDED") ?? 0),
    pendingReservations: reservationCounts.get("PENDING") ?? 0,
    completedReservations: reservationCounts.get("COMPLETED") ?? 0,
    cancelledReservations: reservationCounts.get("CANCELLED") ?? 0,
    usersByCategory,
    reservationStatus: ["PENDING", "ACTIVE", "EXTENDED", "COMPLETED", "CANCELLED"].map(
      (status) => ({
        status,
        count: reservationCounts.get(status as ReservationStatus) ?? 0,
      })
    ),
    activitySeries,
    topServers,
    topUsers,
    recentEvents: recentEvents.map((event) => ({
      id: event.id,
      createdAt: event.createdAt,
      eventType: event.eventType,
      message: event.message,
      userName: event.user
        ? `${event.user.name} ${event.user.firstSurname}`
        : null,
      serverName: event.server?.name ?? null,
    })),
  };
}