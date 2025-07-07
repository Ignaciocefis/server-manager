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

export const deleteUserById = async (id: string) => {
  if (!id) {
    return null;
  }

  try {
    await db.user.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error("Error deleting user by ID:", error);
    return false;
  }
};

export const toggleUserActiveStatus = async (id: string) => {
  if (!id) {
    return null;
  }

  try {
    const user = await db.user.findUnique({
      where: { id },
      select: { isActive: true },
    });
    if (!user) {
      return null;
    }

    await db.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });
    return true;
  } catch (error) {
    console.error("Error toggling user active status:", error);
    return false;
  }
};

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

export async function getAllUsers() {
  try {
    const users = await db.user.findMany({
      include: {
        assignedTo: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return users;
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
}

export async function assignJuniorToResearcher(userId: string, researcherId: string) {
  try {
    if (!userId || !researcherId) {
      return false;
    }

    await db.user.update({
          where: { id: userId },
          data: { assignedTo: { connect: { id: researcherId } } },
        });

    return true;
  } catch (error) {
    console.error("Error assigning researcher to user:", error);
    return false;
  }
}

export async function getAssignedUsers(investigatorId: string) {
  try {
    if (!investigatorId) {
      return [];
    }

    const users = await db.user.findMany({
      where: {
        assignedToId: investigatorId,
      },
      include: {
        assignedTo: true,
    },
    orderBy: { createdAt: "desc" },
    });
    return users;
  } catch (error) {
    console.error("Error fetching assigned users:", error);
    return [];
  }
}
