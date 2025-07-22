import { useSession } from "next-auth/react";
import { useReactTable, getCoreRowModel, ColumnDef } from "@tanstack/react-table";
import { Category } from "@prisma/client";
import { getUserColumns } from "./UsersTable.data";
import { handleDeleteUser, handleToggleActive } from "./UsersTable.handlers";
import { UsersTableDataProps } from "./UsersTable.data.type";

export function useUserTable(data: UsersTableDataProps[], refetch: () => void) {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;
  const category = session?.user?.category as Category | undefined;

  const handleRefresh = () => {
    refetch();
  };

  const columns: ColumnDef<UsersTableDataProps>[] =
    userId && category
      ? getUserColumns(
          userId,
          category,
          (id) => handleDeleteUser(id, refetch),
          (id, newStatus) => handleToggleActive(id, newStatus, refetch),
          handleRefresh
        )
      : [];

  const table = useReactTable<UsersTableDataProps>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return { table, columns };
}
