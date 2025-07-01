import { db } from "@/lib/db";
import { createServerFormSchema } from "@/lib/schemas/server/create.schema";
import { updateServerFormSchema } from "@/lib/schemas/server/update.schema";
import z from "zod";

export const createServer = async (data: z.infer<typeof createServerFormSchema>) => {
  try {
    const server = await db.server.create({
      data,
    });

    return server;
    
  } catch (error) {
    console.error("Error creating server:", error);
    return null;
  }
};

export const updateServer = async (serverId: string, data: z.infer<typeof updateServerFormSchema>) => {
  try {

    const { serverId, ...dataWithoutId } = data;

    const server = await db.server.update({
      where: { id: serverId },
      data: dataWithoutId,
    });

    return server;
    
  } catch (error) {
    console.error("Error updating server:", error);
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
}

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
    });
    return server;
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

    if (user.category === 'ADMIN') {
      const servers = await db.server.findMany();

      return servers.map((server) => ({
        ...server,
        tarjetasInstaladas: 4, // Example value, replace with actual logic
        tarjetasDisponibles: 2, // Example value, replace with actual logic
      }));
    }

    const userWithAccess = await db.user.findUnique({
      where: { id: userId },
      include: {
        serverAccess: {
          include: {
            server: true,
          },
        },
      },
    });

    return userWithAccess?.serverAccess.map((a) => a.server) || [];
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
        userId: userId,
        serverId: serverId,
      },
    });

    return !!access;
  } catch (error) {
    console.error("Error verificando acceso al servidor:", error);
    return false;
  }
};