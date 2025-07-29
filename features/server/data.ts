import { db } from "@/lib/db";
import { ApiResponse } from "@/lib/types/BDResponse.types";
import z from "zod";
import { ServerSummary, ServerSummaryWithReservations } from "@/features/server/types";
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
): Promise<ApiResponse<boolean>> => {
  if (!userId) return { success: false, data: false, error: "No user ID provided" };

  try {
    await db.$transaction(async (tx) => {
      await tx.userServerAccess.deleteMany({ where: { userId } });

      if (serverIds.length > 0) {
        await tx.userServerAccess.createMany({
          data: serverIds.map(serverId => ({ userId, serverId })),
        });
      }
    });

    return { success: true, data: true, error: null };
  } catch (error) {
    console.error("Error assigning servers:", error);
    return { success: false, data: false, error };
  }
};

export const changeServerAvailability = async (
  serverId: string
): Promise<ApiResponse<null>> => {
  if (!serverId) return { success: false, data: null, error: "No server ID provided" };

  try {
    const server = await db.server.findUnique({ where: { id: serverId } });

    if (!server) return { success: false, data: null, error: "Server not found" };

    await db.server.update({
      where: { id: serverId },
      data: { available: !server.available },
    });

    return { success: true, data: null, error: null };
  } catch (error) {
    console.error("Error changing server availability:", error);
    return { success: false, data: null, error };
  }
};