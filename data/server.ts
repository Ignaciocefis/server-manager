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

