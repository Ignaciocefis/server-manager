import { db } from "@/lib/db";

export const getUserById = async (id: string) => {
  if (!id) {
    return null;
  }

  try {
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        firstSurname: true,
        secondSurname: true,
        email: true,
        category: true,
        assignedToId: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return null;
  }
}

export const getUserByEmail = async (email: string) => {
  if (!email) {
    return null;
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
    });
    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

export const getAllResearchers = async () => {
  try {
    const researchers = await db.user.findMany({
      where: {
        category: "RESEARCHER",
      },
      orderBy: {
        name: "asc",
      },
    });
    return researchers;
  } catch (error) {
    console.error("Error fetching researchers:", error);
    return [];
  }
}