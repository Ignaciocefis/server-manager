import { db } from "@/lib/db";
import { formSchema } from "@/lib/schemas/server/create.schema";
import z from "zod";

export const createServer = async (data: z.infer<typeof formSchema>) => {
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

export const existsServerByName = async (name: string) => {
  const existingServer = await db.server.findFirst({
    where: { name },
  });
  return !!existingServer;
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

