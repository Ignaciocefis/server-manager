import { db } from "@/lib/db";
import { ApiResponse } from "@/lib/types/BDResponse.types";
import z from "zod";
import { AccessToServerWithEmailAndGpus, ServerName, ServerSummary, ServerSummaryWithReservations } from "@/features/server/types";
import { createServerFormSchema, updateServerFormSchema } from "@/features/server/shemas";
import { getGpuAvailabilityStats } from "@/features/server/utils";

export const createServer = async (
  data: z.infer<typeof createServerFormSchema>
): Promise<ApiResponse<string | null>> => {
  try {
    const { gpus, ...serverData } = data;

    const server = await db.server.create({
      data: {
        ...serverData,
        gpus: {
          create: gpus.map((gpu) => ({
            name: gpu.name,
            type: gpu.type,
            ramGB: gpu.ramGB,
          })),
        },
      }, select: {
        id: true,
      },
    });

    return { success: true, data: server.id, error: null };
  } catch (error) {
    console.error("Error creating server:", error);
    return { success: false, data: null, error };
  }
};

export const updateServerWithGpus = async (
  data: z.infer<typeof updateServerFormSchema>
): Promise<ApiResponse<ServerSummary | null>> => {
  const { serverId, gpus, ...serverData } = data;

  try {
    const updated = await db.$transaction(async (tx) => {
      const updatedServer = await tx.server.update({
        where: { id: serverId },
        data: serverData,
      });

      const existingGpus = await tx.gpu.findMany({ where: { serverId } });

      const incomingGpuMap = new Map(
        gpus.filter((g): g is typeof g & { id: string } => !!g.id).map((g) => [g.id, g])
      );

      for (const gpu of existingGpus) {
        const incoming = incomingGpuMap.get(gpu.id);
        if (incoming) {
          const updatedFields = {
            name: incoming.name,
            type: incoming.type,
            ramGB: incoming.ramGB,
          };

          const hasChanged = Object.entries(updatedFields).some(
            ([key, val]) => gpu[key as keyof typeof updatedFields] !== val
          );

          if (hasChanged) {
            await tx.gpu.update({ where: { id: gpu.id }, data: updatedFields });
          }
        }
      }

      const incomingIds = new Set(gpus.filter((g): g is typeof g & { id: string } => !!g.id).map(g => g.id));
      const toDelete = existingGpus.filter(g => !incomingIds.has(g.id)).map(g => g.id);

      if (toDelete.length) {
        await tx.gpu.deleteMany({ where: { id: { in: toDelete } } });
      }

      for (const gpu of gpus.filter(g => !g.id)) {
        await tx.gpu.create({ data: { ...gpu, serverId } });
      }

      const finalGpus = await tx.gpu.findMany({
        where: { serverId },
        include: {
          reservations: { where: { status: { in: ["PENDING", "ACTIVE", "EXTENDED"] } } },
        },
      });

      const { installedGpus, availableGpus } = getGpuAvailabilityStats(finalGpus);

      return {
        id: updatedServer.id,
        name: updatedServer.name,
        ramGB: updatedServer.ramGB,
        diskCount: updatedServer.diskCount,
        available: updatedServer.available,
        installedGpus,
        availableGpus,
        gpus: finalGpus.map(({ id, type, name, ramGB, reservations }) => ({
          id,
          type,
          name,
          ramGB,
          userId: reservations[0]?.userId ?? null,
        })),
      };
    });

    return { success: true, data: updated, error: null };
  } catch (error) {
    console.error("Error in updateServerWithGpus:", error);
    return { success: false, data: null, error };
  }
};

export const deleteServer = async (serverId: string): Promise<ApiResponse<null>> => {
  if (!serverId) return { success: false, data: null, error: "No ID provided" };

  try {
    await db.server.delete({ where: { id: serverId } });
    return { success: true, data: null, error: null };
  } catch (error) {
    console.error("Error deleting server:", error);
    return { success: false, data: null, error };
  }
};

export const existsServerById = async (serverId: string): Promise<ApiResponse<boolean>> => {
  if (!serverId) return { success: false, data: false, error: "No ID provided" };

  try {
    const existing = await db.server.findUnique({ where: { id: serverId } });
    return { success: true, data: !!existing, error: null };
  } catch (error) {
    console.error("Error checking server existence by ID:", error);
    return { success: false, data: false, error };
  }
};

export const existsServerByName = async (name: string): Promise<ApiResponse<boolean>> => {
  if (!name) return { success: false, data: false, error: "No name provided" };

  try {
    const existing = await db.server.findFirst({ where: { name } });
    return { success: true, data: !!existing, error: null };
  } catch (error) {
    console.error("Error checking server existence by name:", error);
    return { success: false, data: false, error };
  }
};

export const getServerById = async (id: string): Promise<ApiResponse<ServerSummary | null>> => {
  if (!id) return { success: false, data: null, error: "No ID provided" };

  try {
    const server = await db.server.findUnique({
      where: { id },
      include: {
        gpus: {
          include: {
            reservations: { where: { status: { in: ["PENDING", "ACTIVE", "EXTENDED"] } } },
          },
        },
      },
    });

    if (!server) return { success: false, data: null, error: "Server not found" };

    const { installedGpus, availableGpus } = getGpuAvailabilityStats(server.gpus);

    return {
      success: true,
      data: {
        ...server,
        installedGpus,
        availableGpus,
      },
      error: null
    };
  } catch (error) {
    console.error("Error fetching server by ID:", error);
    return { success: false, data: null, error };
  }
};

export const getServerByIdWithReservations = async (id: string): Promise<ApiResponse<ServerSummaryWithReservations | null>> => {
  if (!id) return { success: false, data: null, error: "No ID provided" };

  try {
    const server = await db.server.findUnique({
      where: { id },
      include: {
        gpus: {
          include: {
            reservations: { where: { status: { in: ["PENDING", "ACTIVE", "EXTENDED"] } } },
          },
        },
        reservations: {
          where: { status: { in: ["ACTIVE", "EXTENDED"] } },
          include: {
            user: { select: { name: true, firstSurname: true, secondSurname: true } },
            gpu: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!server) return { success: false, data: null, error: "Server not found" };

    const { installedGpus, availableGpus } = getGpuAvailabilityStats(server.gpus);

    return {
      success: true,
      data: {
        ...server,
        installedGpus,
        availableGpus,
        reservations: server.reservations
          .filter((r): r is typeof r & { status: "ACTIVE" | "EXTENDED" } =>
            r.status === "ACTIVE" || r.status === "EXTENDED"
          ),
      },
      error: null,
    };

  } catch (error) {
    console.error("Error fetching server by ID:", error);
    return { success: false, data: null, error };
  }
};

export const getUserAccessibleServers = async (userId: string): Promise<ApiResponse<ServerSummary[] | null>> => {
  if (!userId) return { success: false, data: null, error: "No user ID provided" };

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { category: true },
    });

    if (!user) return { success: false, data: [], error: "User not found" };

    if (user.category === "ADMIN") {
      const servers = await db.server.findMany({
        include: {
          gpus: {
            include: {
              reservations: { where: { status: { in: ["PENDING", "ACTIVE", "EXTENDED"] } } },
            },
          },
        },
      });

      const result = servers.map(server => {
        const { installedGpus, availableGpus } = getGpuAvailabilityStats(server.gpus);
        return { ...server, installedGpus, availableGpus };
      });

      return { success: true, data: result, error: null };
    }

    const userWithAccess = await db.user.findUnique({
      where: { id: userId },
      include: {
        serverAccess: {
          include: {
            server: {
              include: {
                gpus: {
                  include: {
                    reservations: {
                      where: { status: { in: ["PENDING", "ACTIVE", "EXTENDED"] } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const result =
      userWithAccess?.serverAccess.map(access => {
        const server = access.server;
        const { installedGpus, availableGpus } = getGpuAvailabilityStats(server.gpus);
        return { ...server, installedGpus, availableGpus };
      }) || [];

    return { success: true, data: result, error: null };

  } catch (error) {
    console.error("Error fetching user servers:", error);
    return { success: false, data: [], error };
  }
};

export const hasAccessToServer = async (userId: string, serverId: string): Promise<ApiResponse<boolean>> => {
  if (!userId || !serverId) return { success: false, data: false, error: "Missing parameters" };

  try {
    const user = await db.user.findUnique({ where: { id: userId }, select: { category: true } });

    if (!user) return { success: false, data: false, error: "User not found" };
    if (user.category === "ADMIN") return { success: true, data: true, error: null };

    const access = await db.userServerAccess.findFirst({ where: { userId, serverId } });

    return { success: true, data: !!access, error: null };
  } catch (error) {
    console.error("Error checking access to server:", error);
    return { success: false, data: false, error };
  }
};

export const assignServersToUser = async (
  userId: string,
  serverIds: string[]
): Promise<ApiResponse<{ removed: ServerName[] }>> => {
  if (!userId) return { success: false, data: { removed: [] }, error: "No user ID provided" };

  try {
    let removed: { id: string, name: string }[] = [];
    await db.$transaction(async (tx) => {
      const currentAccess = await tx.userServerAccess.findMany({ where: { userId }, select: { serverId: true } });
      const currentServerIds = currentAccess.map(a => a.serverId);

      const removedIds = currentServerIds.filter(id => !serverIds.includes(id));
      if (removedIds.length > 0) {
        const removedServers = await tx.server.findMany({
          where: { id: { in: removedIds } },
          select: { id: true, name: true }
        });
        removed = removedServers;
      }

      await tx.userServerAccess.deleteMany({ where: { userId } });

      if (serverIds.length > 0) {
        await tx.userServerAccess.createMany({
          data: serverIds.map(serverId => ({ userId, serverId })),
        });
      }
    });

    return { success: true, data: { removed }, error: null };
  } catch (error) {
    console.error("Error assigning servers:", error);
    return { success: false, data: { removed: [] }, error };
  }
};

export const changeServerAvailability = async (
  serverId: string
): Promise<ApiResponse<boolean>> => {
  if (!serverId) return { success: false, data: false, error: "No server ID provided" };

  try {
    const server = await db.server.findUnique({ where: { id: serverId } });

    if (!server) return { success: false, data: false, error: "Server not found" };

    const availability = await db.server.update({
      where: { id: serverId },
      data: { available: !server.available },
      select: { available: true }
    });

    if (!availability.available) {
      await db.gpuReservation.updateMany({
        where: { serverId },
        data: { status: "CANCELLED", cancelledAt: new Date(), actualEndDate: new Date() }
      });

      const canceledReservations = await db.gpuReservation.updateManyAndReturn({
        where: { serverId, status: { in: ["ACTIVE", "PENDING", "EXTENDED"] } },
        data: { status: "CANCELLED", cancelledAt: new Date(), actualEndDate: new Date() },
        include: { gpu: { select: { name: true } }, server: { select: { name: true } } }
      });

      for (const reservation of canceledReservations) {
        const eventLog = await db.eventLog.create({
          data: {
            eventType: "RESERVATION_CANCELLED",
            message: `La reserva de la tarjeta gráfica ${reservation.gpu.name} del servidor ${reservation.server.name} ha sido cancelada al cambiar la disponibilidad del servidor a no disponible.`,
            reservationId: reservation.id,
            serverId: serverId,
          }, select: { id: true }
        });

        await db.userNotification.create({
          data: {
            userId: reservation.userId,
            eventLogId: eventLog.id,
          },
        });
      }
    }

    return { success: true, data: availability.available, error: null };
  } catch (error) {
    console.error("Error changing server availability:", error);
    return { success: false, data: false, error };
  }
};

export const getServersNameById = async (
  serversId: string[]
): Promise<ApiResponse<ServerName[]>> => {
  if (!Array.isArray(serversId) || serversId.length === 0) {
    return { success: false, data: [], error: "Invalid server IDs" };
  }

  try {
    const servers = await db.server.findMany({
      where: { id: { in: serversId } },
      select: {
        id: true,
        name: true
      },
    });

    return { success: true, data: servers, error: null };
  } catch (error) {
    console.error("Error fetching server names:", error);
    return { success: false, data: [], error };
  }
};

export const getAllUsersWithAccessToServer = async (serverId: string): Promise<ApiResponse<AccessToServerWithEmailAndGpus[]>> => {
  if (!serverId) return { success: false, data: [], error: "No server ID provided" };

  try {
    const users = await db.user.findMany({
      where: {
        serverAccess: {
          some: { serverId }
        }
      },
      select: {
        email: true,
        gpuReservations: {
          where: { serverId, status: { in: ["PENDING", "ACTIVE", "EXTENDED"] } },
          select: {
            gpu: { select: { name: true } },
          }
        }
      },
    });

    const usersWithGpus: AccessToServerWithEmailAndGpus[] = users.map(user => ({
      email: user.email,
      gpus: user.gpuReservations.map(reservation => reservation.gpu.name)
    }));

    return { success: true, data: usersWithGpus, error: null };
  } catch (error) {
    console.error("Error fetching users with access to server:", error);
    return { success: false, data: null, error };
  }
};
