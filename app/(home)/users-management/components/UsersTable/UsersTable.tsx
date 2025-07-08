"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useSession } from "next-auth/react";
import { Category } from "@prisma/client";
import { getUserColumns } from "./UsersTable.data";
import { toast } from "sonner";
import axios from "axios";
import { UserTableProps } from "./UserTable.type";

export function UserTable({ data, isLoading, refetch }: UserTableProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;
  const category = session?.user?.category as Category | undefined;

  const handleDeleteUser = async (userId: string) => {
    try {
      await axios.delete("/api/auth/delete", {
        data: { userId },
      });
      toast.success("Usuario eliminado correctamente.");
      refetch();
    } catch (error) {
      console.error("Error al eliminar usuario", error);
      toast.error("Error al eliminar el usuario.");
    }
  };

  const handleToggleActive = async (userId: string, newStatus: boolean) => {
    try {
      await axios.patch("/api/auth/active/toggleActive", {
        userId,
      });
      toast.success(`Usuario ${newStatus ? "activado" : "desactivado"}`);
      refetch();
    } catch (error) {
      console.error("Error al cambiar estado", error);
      toast.error("No se pudo cambiar el estado del usuario.");
    }
  };

  const handleRefresh = async () => {
    refetch();
  };

  const columns =
    userId && category
      ? getUserColumns(
          userId,
          category,
          handleDeleteUser,
          handleToggleActive,
          handleRefresh
        )
      : [];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <div className="text-center py-10 text-2xl">Cargando...</div>;
  }

  return (
    <div className="w-11/12 mx-auto mt-6 px-8 py-4 rounded-xl border overflow-hidden shadow-sm bg-gray-app-100">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={`text-sm font-semibold ${
                    header.column.id === "actions" ? "text-left w-1" : ""
                  }`}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-opacity-20 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={`text-sm ${
                      cell.column.id === "actions" ? "text-right w-1" : ""
                    }`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center py-10 text-muted-foreground rounded-xl"
              >
                No hay usuarios.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
