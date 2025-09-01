import { UsersTableDataProps, UsersWithRelations } from "./components/UsersTable/UserTable.type";
import { GetUsersParams } from "./types";
import { getFullName } from "./utils";

export const CATEGORY_TRANSLATIONS: Record<string, string> = {
  ADMIN: "Administrador",
  RESEARCHER: "Investigador",
  JUNIOR: "Júnior",
};

export const getPaginationAndSortUsers = (params?: GetUsersParams) => {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const skip = (page - 1) * limit;
  const sortField = params?.sortField ?? "createdAt";
  const sortOrder = params?.sortOrder ?? "desc";
  const filterTitle = params?.filterTitle ?? "";

  return { page, limit, skip, sortField, sortOrder, filterTitle };
}

export const buildOrderByUsers = (sortField: string, sortOrder?: "asc" | "desc") => {
  switch (sortField) {
    case "userFullName":
      return { firstSurname: sortOrder };
    case "assignedToFullName":
      return { assignedTo: { firstSurname: sortOrder } };
    case "servers":
      return { serverAccess: { _count: sortOrder } };
    case "status":
      return { isActive: sortOrder };
    case "actions":
      return { firstSurname: sortOrder };
    default:
      return { [sortField]: sortOrder };
  }
}

export const formatUsers = (
  users: UsersWithRelations[]
): UsersTableDataProps[] => {
  return users.map((user) => ({
    id: user.id,
    userFullName: user
      ? getFullName(
        user.firstSurname ?? undefined,
        user.secondSurname ?? undefined,
        user.name ?? undefined,
      ) || "-"
      : "-",
    email: user.email,
    category: user.category,
    isActive: user.isActive,
    assignedToFullName: user.assignedTo
      ? getFullName(
        user.assignedTo.firstSurname ?? undefined,
        user.assignedTo.name ?? undefined,
      ) || "-"
      : "-",
    assignedToId: user.assignedTo?.id || undefined,
    servers: Array.isArray(user.serverAccess)
      ? user.serverAccess.map((sa: { server: { name: string } }) => sa.server.name)
      : user.serverAccess && (user.serverAccess as { server: { name: string } }).server
        ? [(user.serverAccess as { server: { name: string } }).server.name]
        : [],
  }));
}