import { UserName, UserSummary, UserSummaryWithAssignedTo, UserWithOnlyPassword, UserWithPassword } from "@/features/user/types";
import { db } from "@/lib/db";
import { ApiResponse } from "@/lib/types/BDResponse.types";
import { createUserSchema } from "./schemas";
import z from "zod";
import bcrypt from "bcryptjs";

export const getUserById = async (id: string): Promise<ApiResponse<UserSummary | null>> => {
  if (!id) {
    return { success: false, data: null, error: "No ID provided" };
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
    return { success: true, data: user, error: null };
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    return { success: false, data: null, error };
  }
};

export const userExistsById = async (id: string): Promise<ApiResponse<boolean>> => {
  if (!id) {
    return { success: false, data: false, error: "No ID provided" };
  }

  try {
    const user = await db.user.findUnique({ where: { id } });
    return { success: true, data: user !== null, error: null };
  } catch (error) {
    console.error("Error checking if user exists by ID:", error);
    return { success: false, data: false, error };
  }
};

export const getUserByEmailWithPassword = async (email: string): Promise<ApiResponse<UserWithPassword | null>> => {
  if (!email) {
    return { success: false, data: null, error: "No email provided" };
  }

  try {
    const user = await db.user.findUnique({
      where: { email }, select: {
        id: true,
        email: true,
        password: true,
        name: true,
        firstSurname: true,
        secondSurname: true,
        category: true,
        isActive: true,
        assignedToId: true,
      },
    });
    return { success: true, data: user, error: null };
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return { success: false, data: null, error };
  }
};

export const userIsActive = async (email: string): Promise<ApiResponse<boolean>> => {
  if (!email) {
    return { success: false, data: false, error: "No email provided" };
  }
  try {
    const user = await db.user.findUnique({
      where: { email },
      select: { isActive: true },
    });

    if (!user) {
      return { success: false, data: false, error: "User not found" };
    }

    return { success: true, data: user.isActive, error: null };
  } catch (error) {
    console.error("Error checking if user is active:", error);
    return { success: false, data: false, error };
  }
};

export const deleteUserById = async (id: string): Promise<ApiResponse<null>> => {
  if (!id) {
    return { success: false, data: null, error: "No ID provided" };
  }

  try {
    await db.user.delete({ where: { id } });
    return { success: true, data: null, error: null };
  } catch (error) {
    console.error("Error deleting user by ID:", error);
    return { success: false, data: null, error };
  }
};

export const toggleUserActiveStatus = async (id: string): Promise<ApiResponse<boolean>> => {
  if (!id) {
    return { success: false, data: null, error: "No ID provided" };
  }

  try {
    const user = await db.user.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!user) {
      return { success: false, data: null, error: "User not found" };
    }

    await db.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    return { success: true, data: true, error: null };
  } catch (error) {
    console.error("Error toggling user active status:", error);
    return { success: false, data: null, error };
  }
};

export const getAllResearchers = async (): Promise<ApiResponse<UserSummary[] | null>> => {
  try {
    const researchers = await db.user.findMany({
      where: { category: "RESEARCHER" },
      select: {
        id: true,
        name: true,
        firstSurname: true,
        secondSurname: true,
        email: true,
        category: true,
        assignedToId: true,
      },
      orderBy: { name: "asc" },
    });
    return { success: true, data: researchers, error: null };
  } catch (error) {
    console.error("Error fetching researchers:", error);
    return { success: false, data: null, error };
  }
};

export const getAllUsers = async (): Promise<ApiResponse<UserSummaryWithAssignedTo[] | null>> => {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        firstSurname: true,
        secondSurname: true,
        email: true,
        category: true,
        assignedToId: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            firstSurname: true,
            secondSurname: true,
            email: true,
            category: true,
            assignedToId: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
    return { success: true, data: users, error: null };
  } catch (error) {
    console.error("Error fetching all users:", error);
    return { success: false, data: null, error };
  }
};

export const assignJuniorToResearcher = async (
  userId: string,
  researcherId: string
): Promise<ApiResponse<boolean>> => {
  if (!userId || !researcherId) {
    return { success: false, data: null, error: "Missing userId or researcherId" };
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: { assignedTo: { connect: { id: researcherId } } },
    });
    return { success: true, data: true, error: null };
  } catch (error) {
    console.error("Error assigning researcher to user:", error);
    return { success: false, data: null, error };
  }
};

export const getAssignedUsers = async (investigatorId: string): Promise<ApiResponse<UserSummaryWithAssignedTo[]>> => {
  if (!investigatorId) {
    return { success: false, data: null, error: "No investigatorId provided" };
  }

  try {
    const users = await db.user.findMany({
      where: { assignedToId: investigatorId },
      select: {
        id: true,
        name: true,
        firstSurname: true,
        secondSurname: true,
        email: true,
        category: true,
        assignedToId: true,
        assignedTo: {
          select: {
            id: true,
            name: true,
            firstSurname: true,
            secondSurname: true,
            email: true,
            category: true,
            assignedToId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: users, error: null };
  } catch (error) {
    console.error("Error fetching assigned users:", error);
    return { success: false, data: null, error };
  }
};

export const createUser = async (
  data: z.infer<typeof createUserSchema>,
  generatedPassword: string
): Promise<ApiResponse<null>> => {
  const { email, name, firstSurname, secondSurname, category, assignedToId } = data;
  const password = generatedPassword;

  if (!email || !name || !firstSurname || !category || !password) {
    return { success: false, data: null, error: "Missing required fields" };
  }

  try {
    await db.user.create({
      data: {
        email,
        password: await bcrypt.hash(generatedPassword, 10),
        name,
        firstSurname,
        secondSurname,
        category,
        assignedTo: category === "JUNIOR" && assignedToId
          ? { connect: { id: assignedToId } }
          : undefined,
      },
    });
    return { success: true, data: null, error: null };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, data: null, error };
  }
};

export const existsUserByEmail = async (email: string): Promise<ApiResponse<boolean>> => {
  if (!email) {
    return { success: false, data: false, error: "No email provided" };
  }

  try {
    const user = await db.user.findUnique({ where: { email }, select: { id: true } });
    return { success: true, data: user !== null, error: null };
  } catch (error) {
    console.error("Error checking if user exists by email:", error);
    return { success: false, data: false, error };
  }
}

export const getUserNameById = async (id: string): Promise<ApiResponse<UserName | null>> => {
  if (!id) {
    return { success: false, data: null, error: "No id provided" };
  }

  try {
    const user = await db.user.findUnique({
      where: { id },
      select: {
        name: true,
        firstSurname: true,
        secondSurname: true,
      },
    });

    if (!user) {
      return { success: false, data: null, error: "User not found" };
    }

    return { success: true, data: user, error: null };
  } catch (error) {
    console.error("Error fetching user name by id:", error);
    return { success: false, data: null, error: "Internal server error" };
  }
};

export const getUserByIdWithPassword = async (id: string): Promise<ApiResponse<UserWithOnlyPassword | null>> => {
  if (!id) {
    return { success: false, data: null, error: "No id provided" };
  }

  try {
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      return { success: false, data: null, error: "User not found" };
    }

    return { success: true, data: user, error: null };
  } catch (error) {
    console.error("Error fetching user by id with password:", error);
    return { success: false, data: null, error };
  }
};

export const updatePassword = async (
  userId: string,
  newPassword: string
): Promise<ApiResponse<null>> => {
  if (!userId || !newPassword) {
    return { success: false, data: null, error: "Missing required fields" };
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: { password: newPassword },
    });

    return { success: true, data: null, error: null };
  } catch (error) {
    console.error("Error updating password:", error);
    return { success: false, data: null, error };
  }
};

export const updateUser = async (
  userId: string,
  data: UserName
): Promise<ApiResponse<null>> => {
  if (!userId || !data) {
    return { success: false, data: null, error: "Missing required fields" };
  }

  const { name, firstSurname, secondSurname } = data;

  try {
    await db.user.update({
      where: { id: userId },
      data: {
        name,
        firstSurname,
        secondSurname,
      },
    });

    return { success: true, data: null, error: null };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, data: null, error };
  }
}
