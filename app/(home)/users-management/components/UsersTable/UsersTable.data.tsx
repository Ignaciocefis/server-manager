import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { UsersTableDataProps } from "./UsersTable.data.type";
import { Category } from "@prisma/client";
import { CheckCheck, Paperclip, Pause, ServerIcon, Trash2 } from "lucide-react";

export function getUserColumns(
  userId: string,
  userCategory: Category,
  onDelete: (userId: string) => void
): ColumnDef<UsersTableDataProps>[] {
  const isAdmin = userCategory === "ADMIN";
  const isResearcher = userCategory === "RESEARCHER";

  return [
    {
      accessorKey: "name",
      header: "Usuario",
      cell: ({ row }) => {
        const u = row.original;
        return `${u.name} ${u.firstSurname} ${u.secondSurname || ""}`;
      },
    },
    { accessorKey: "email", header: "Correo" },
    {
      accessorKey: "assignedTo",
      header: "Asignado a",
      cell: ({ row }) =>
        row.original.assignedTo
          ? `${row.original.assignedTo.name} ${row.original.assignedTo.firstSurname}`
          : "-",
    },
    {
      accessorKey: "category",
      header: "Categoría",
      cell: ({ row }) => {
        const value = row.getValue("category") as string;

        const categoryMap: Record<string, string> = {
          ADMIN: "Administrador",
          RESEARCHER: "Investigador",
          JUNIOR: "Junior",
        };

        return categoryMap[value] ?? value;
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const u = row.original;
        const isJunior = u.category === "JUNIOR";

        return (
          <div className="flex gap-2 items-center justify-end">
            {isJunior && (isAdmin || isResearcher) && (
              <Button
                variant="secondary"
                size="sm"
                className="bg-gray-app-200 hover:bg-gray-app-300"
              >
                <ServerIcon className="w-4 h-4 mr-1" />
                Servidores
              </Button>
            )}
            {isJunior && isAdmin && (
              <Button
                variant="secondary"
                size="sm"
                className="bg-gray-app-200 hover:bg-gray-app-300"
              >
                <Paperclip className="w-4 h-4 mr-1" />
                Asignar
              </Button>
            )}
            {u.category !== "ADMIN" && (
              <Button
                variant="secondary"
                size="sm"
                className={
                  u.isActive
                    ? "bg-green-app-500-transparent hover:bg-green-app-500"
                    : "bg-red-app-500-transparent hover:bg-red-app-500"
                }
              >
                {u.isActive ? (
                  <CheckCheck className="w-4 h-4 mr-1" />
                ) : (
                  <Pause className="w-4 h-4 mr-1" />
                )}
                {u.isActive ? "Activo" : "Desactivado"}
              </Button>
            )}
            {isAdmin && (
              <Button
                variant="destructive"
                size="sm"
                className=" bg-red-app-500-transparent hover:bg-red-app-500"
                onClick={() => onDelete(u.id)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Borrar
              </Button>
            )}
          </div>
        );
      },
    },
  ];
}
