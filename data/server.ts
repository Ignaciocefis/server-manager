import { ServerListItem } from "@/app/(home)/components/Server/ServerList/ServerList.types";
import { db } from "@/lib/db";
import { createServerFormSchema } from "@/lib/schemas/server/create.schema";
import { updateServerFormSchema } from "@/lib/schemas/server/update.schema";
import z from "zod";

export async function createServer(data: z.infer<typeof createServerFormSchema>) {
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
            serverId: undefined,
          })),
        },
      },
    });

    return server;
  } catch (error) {
    console.error("Error creating server:", error);
    return null;
  }
}

export const updateServerWithGpus = async (
  data: z.infer<typeof updateServerFormSchema>
): Promise<ServerListItem | null> => {
  const { serverId, gpus, ...serverData } = data;

  try {
    return await db.$transaction(async (tx) => {
      const updatedServer = await tx.server.update({
        where: { id: serverId },
        data: {
          name: serverData.name,
          ramGB: serverData.ramGB,
          diskCount: serverData.diskCount,
          available: serverData.available,
        },
      });

      const existingGpus = await tx.gpu.findMany({ where: { serverId } });

      const incomingGpuMap = new Map(
        gpus
          .filter((gpu): gpu is typeof gpu & { id: string } => !!gpu.id)
          .map((gpu) => [gpu.id, gpu])
      );

      for (const existingGpu of existingGpus) {
        const incomingGpu = incomingGpuMap.get(existingGpu.id);
        if (incomingGpu) {
          const updatedFields = {
            name: incomingGpu.name,
            type: incomingGpu.type,
            ramGB: incomingGpu.ramGB,
          };

          const hasChanged = Object.entries(updatedFields).some(
            ([key, value]) => existingGpu[key as keyof typeof updatedFields] !== value
          );

          if (hasChanged) {
            await tx.gpu.update({
              where: { id: existingGpu.id },
              data: updatedFields,
            });
          }
        }
      }

      const incomingIds = new Set(
        gpus.filter((g): g is typeof g & { id: string } => !!g.id).map((g) => g.id)
      );

      const toDeleteIds = existingGpus
        .filter((gpu) => !incomingIds.has(gpu.id))
        .map((gpu) => gpu.id);

      if (toDeleteIds.length > 0) {
        await tx.gpu.deleteMany({
          where: {
            id: { in: toDeleteIds },
          },
        });
      }

      for (const gpu of gpus.filter((gpu) => !gpu.id)) {
        await tx.gpu.create({
          data: {
            name: gpu.name,
            type: gpu.type,
            ramGB: gpu.ramGB,
            serverId,
          },
        });
      }

      const finalGpus = await tx.gpu.findMany({
        where: { serverId },
        include: {
          reservations: {
            where: {
              status: {
                in: ["PENDING", "ACTIVE", "EXTENDED"],
              },
            },
          },
        },
      });

      const installedGpus = finalGpus.length;
      const availableGpus = finalGpus.filter(
        gpu => gpu.reservations.every(
          r => r.status !== "ACTIVE" && r.status !== "EXTENDED"
        )
      ).length;

      const serverListItem: ServerListItem = {
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
          status: reservations.length === 0 ? "AVAILABLE" : "IN_USE",
          userId: reservations.length > 0 ? reservations[0].userId ?? null : null,
        })),
      };

      return serverListItem;
    });
  } catch (error) {
    console.error("Error in updateServerWithGpus:", error);
    return null;
  }
};

export const deleteServer = async (serverId: string) => {
  try {
    await db.server.delete({
      where: { id: serverId },
    });
    return true;
  } catch (error) {
    console.error("Error deleting server:", error);
    return false;
  }
};

export const existsServerById = async (id: string) => {
  const existingServer = await db.server.findUnique({
    where: { id },
  });
  return !!existingServer;
};

export const existsServerByName = async (name: string) => {
  const existingServer = await db.server.findFirst({
    where: { name },
  });
  return !!existingServer;
};

export const getServerById = async (id: string) => {
  try {
    const server = await db.server.findUnique({
      where: { id },
      include: {
        gpus: {
          include: {
            reservations: {
              where: {
                status: {
                  in: ["PENDING", "ACTIVE", "EXTENDED"],
                },
              },
            },
          },
        },
        reservations: {
          where: {
            status: {
              in: ["ACTIVE", "EXTENDED"],
            },
          },
          include: {
            user: {
              select: {
                name: true,
                firstSurname: true,
                secondSurname: true,
              },
            },
            gpu: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!server) return null;

    const installedGpus = server.gpus.length;
    const availableGpus = server.gpus.filter(
      gpu =>
        gpu.reservations.every(
          r => r.status !== "ACTIVE" && r.status !== "EXTENDED"
        )
    ).length;

    return {
      ...server,
      installedGpus,
      availableGpus,
    };
  } catch (error) {
    console.error("Error fetching server by ID:", error);
    return null;
  }
};


export const getUserServers = async (userId: string) => {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { category: true },
    });

    if (!user) return [];

    if (user.category === "ADMIN") {
      const servers = await db.server.findMany({
        include: {
          gpus: {
            include: {
              reservations: {
                where: {
                  status: {
                    in: ["PENDING", "ACTIVE", "EXTENDED"],
                  },
                },
              },
            },
          },
        },
      });

      return servers.map((server) => {
        const installedGpus = server.gpus.length;
        const availableGpus = server.gpus.filter(
          gpu => gpu.reservations.every(
            r => r.status !== "ACTIVE" && r.status !== "EXTENDED"
          )
        ).length;

        return {
          ...server,
          installedGpus,
          availableGpus,
        };
      });
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
                      where: {
                        status: {
                          in: ["PENDING", "ACTIVE", "EXTENDED"],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return (
      userWithAccess?.serverAccess.map((access) => {
        const server = access.server;
        const installedGpus = server.gpus.length;
        const availableGpus = server.gpus.filter(
          gpu => gpu.reservations.every(
            r => r.status !== "ACTIVE" && r.status !== "EXTENDED"
          )
        ).length;
        return {
          ...server,
          installedGpus,
          availableGpus,
        };
      }) || []
    );
  } catch (error) {
    console.error("Error fetching user servers:", error);
    return [];
  }
};

export const hasAccessToServer = async (userId: string, serverId: string): Promise<boolean> => {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { category: true },
    });

    if (!user) return false;

    if (user.category === "ADMIN") return true;

    const access = await db.userServerAccess.findFirst({
      where: {
        userId,
        serverId,
      },
    });

    return !!access;
  } catch (error) {
    console.error("Error verificando acceso al servidor:", error);
    return false;
  }
};

export const assignServersToUser = async (userId: string, serverIds: string[]) => {
  try {
    const newLinks = serverIds.map(serverId => ({
      userId,
      serverId,
    }));

    await db.$transaction(async (tx) => {
      await tx.userServerAccess.deleteMany({
        where: { userId },
      });

      if (newLinks.length > 0) {
        await tx.userServerAccess.createMany({
          data: newLinks,
        });
      }
    });

    return true;
  } catch (error) {
    console.error("Error assigning servers in transaction:", error);
    return false;
  }
};
