import { db } from "@/lib/db";

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