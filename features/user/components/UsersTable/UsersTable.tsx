"use client";

import {
  Search,
  RefreshCw,
  Settings2,
  ChevronDown,
  ChevronUp,
  Loader2,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Trash2,
  MoreVertical,
  UserRoundCheck,
  UserRoundMinus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  handleRefreshUsers,
  handleSortUsers,
  toggleColumnUsers,
  handleLimitChangeUsers,
  handlePageChangeUsers,
} from "./UsersTable.helpers";
import {
  getCategoryTypeBadge,
  getServerBadge,
  getStatusTypeBadge,
} from "../../utils";
import { useHasCategory } from "@/hooks/useHasCategory";
import { AssignResearcherDialog, AssignServersDialog } from "..";
import { handleDeleteUser, handleToggleActive } from "./UsersTable.handlers";
import { getNestedValue, toDisplay } from "@/features/eventLog/utils";
import { UsersTableProps } from "./UserTable.type";
import { toast } from "sonner";

export function UsersTable({
  users,
  loading,
  error,
  pagination,
  visibleColumns,
  setVisibleColumns,
  searchTerm,
  setSearchTerm,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  fetchUsers,
}: UsersTableProps) {
  const isAdmin = useHasCategory("ADMIN");
  const isResearcher = useHasCategory("RESEARCHER");

  return (
    <div className="space-y-4 w-11/12 mx-auto mb-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="w-4 h-4 mr-2" />
                Columnas
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {visibleColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  checked={column.visible}
                  onCheckedChange={() =>
                    toggleColumnUsers(
                      column.key,
                      visibleColumns,
                      setVisibleColumns
                    )
                  }
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              handleRefreshUsers(
                fetchUsers,
                pagination,
                searchTerm,
                sortField,
                sortOrder as "desc" | "asc"
              )
            }
            disabled={loading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            Actualizar
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 border border-destructive/20 bg-destructive/10 text-destructive rounded-lg">
          Error: {error}
        </div>
      )}

      <div className="border border-border rounded-lg bg-gray-app-100 overflow-hidden">
        <Table className="w-full text-sm">
          <TableHeader className="bg-muted/50">
            <TableRow>
              {visibleColumns
                .filter((col) => col.visible)
                .map((column) => (
                  <TableHead
                    key={column.key}
                    className="font-semibold cursor-pointer select-none px-4 py-2"
                    onClick={() =>
                      handleSortUsers(
                        column.key,
                        sortField,
                        setSortField,
                        sortOrder,
                        setSortOrder
                      )
                    }
                  >
                    <div className="flex items-center gap-1">
                      {column.label}
                      {sortField === column.key &&
                        (sortOrder === "asc" ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        ))}
                    </div>
                  </TableHead>
                ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.filter((col) => col.visible).length}
                  className="text-center py-8"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cargando usuarios...
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.filter((col) => col.visible).length}
                  className="text-center py-8 text-muted-foreground"
                >
                  No se encontraron usuarios.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user, idx) => {
                const isUserJunior = user.category === "JUNIOR";

                return (
                  <TableRow
                    key={user.id}
                    className={`hover:bg-muted/40 focus-within:bg-muted/50 ${
                      idx % 2 === 0 ? "even:bg-muted/30" : ""
                    }`}
                  >
                    {visibleColumns
                      .filter((col) => col.visible)
                      .map((column) => {
                        let content: React.ReactNode;

                        if (column.key === "servers") {
                          content = getServerBadge(user.servers);
                        } else if (column.key === "category") {
                          content = getCategoryTypeBadge(user.category);
                        } else if (column.key === "status") {
                          content = getStatusTypeBadge(user.isActive);
                        } else if (column.key === "actions") {
                          content = (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {((isAdmin &&
                                  (user.category === "RESEARCHER" ||
                                    user.category === "JUNIOR")) ||
                                  (isResearcher &&
                                    user.category === "JUNIOR")) && (
                                  <DropdownMenuItem asChild>
                                    <AssignServersDialog
                                      userId={user.id}
                                      editorId={user.id}
                                      onAssigned={() =>
                                        handleRefreshUsers(
                                          fetchUsers,
                                          pagination,
                                          searchTerm,
                                          sortField,
                                          sortOrder as "desc" | "asc"
                                        )
                                      }
                                    />
                                  </DropdownMenuItem>
                                )}

                                {isUserJunior && isAdmin && (
                                  <DropdownMenuItem asChild>
                                    <AssignResearcherDialog
                                      userId={user.id}
                                      researcherId={
                                        user.assignedToId ?? undefined
                                      }
                                      onAssigned={() =>
                                        handleRefreshUsers(
                                          fetchUsers,
                                          pagination,
                                          searchTerm,
                                          sortField,
                                          sortOrder as "desc" | "asc"
                                        )
                                      }
                                    />
                                  </DropdownMenuItem>
                                )}

                                {user.category !== "ADMIN" && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      handleToggleActive(user.id);
                                      handleRefreshUsers(
                                        fetchUsers,
                                        pagination,
                                        searchTerm,
                                        sortField,
                                        sortOrder as "desc" | "asc"
                                      );
                                    }}
                                    className="text-sm rounded-sm cursor-pointer select-none focus:text-accent-foreground focus:bg-green-100"
                                  >
                                    {user.isActive ? (
                                      <>
                                        <UserRoundMinus className="w-4 h-4 mr-2" />
                                        Desactivar
                                      </>
                                    ) : (
                                      <>
                                        <UserRoundCheck className="w-4 h-4 mr-2" />
                                        Activar
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                )}

                                {isAdmin && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-red-600 focus:bg-red-100"
                                      onClick={async () => {
                                        try {
                                          await handleDeleteUser(user.id);
                                          handleRefreshUsers(
                                            fetchUsers,
                                            pagination,
                                            searchTerm,
                                            sortField,
                                            sortOrder as "desc" | "asc"
                                          );
                                        } catch (error) {
                                          console.error(
                                            "Error deleting user:",
                                            error
                                          );
                                          toast.error(
                                            "Error al eliminar usuario"
                                          );
                                        }
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Borrar
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          );
                        } else {
                          content = toDisplay(getNestedValue(user, column.key));
                        }

                        return (
                          <TableCell key={column.key} className="px-4 py-2">
                            {content}
                          </TableCell>
                        );
                      })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-b-lg gap-2">
        <div className="text-sm text-muted-foreground">
          Mostrando del{" "}
          <span className="font-medium">
            {(pagination.page - 1) * pagination.limit + 1} al{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)}
          </span>{" "}
          de <span className="font-medium">{pagination.total}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mostrar:</span>
            <Select
              value={pagination.limit.toString()}
              onValueChange={(val) =>
                handleLimitChangeUsers(
                  fetchUsers,
                  pagination,
                  searchTerm,
                  sortField,
                  sortOrder as "desc" | "asc",
                  val
                )
              }
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 25, 50, 100].map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handlePageChangeUsers(
                  fetchUsers,
                  pagination,
                  searchTerm,
                  sortField,
                  sortOrder as "desc" | "asc",
                  1
                )
              }
              disabled={!pagination.hasPrev}
              className="px-2"
            >
              <ChevronsLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handlePageChangeUsers(
                  fetchUsers,
                  pagination,
                  searchTerm,
                  sortField,
                  sortOrder as "desc" | "asc",
                  pagination.page - 1
                )
              }
              disabled={!pagination.hasPrev}
              className="px-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-3 text-sm text-muted-foreground">
              {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handlePageChangeUsers(
                  fetchUsers,
                  pagination,
                  searchTerm,
                  sortField,
                  sortOrder as "desc" | "asc",
                  pagination.page + 1
                )
              }
              disabled={!pagination.hasNext}
              className="px-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handlePageChangeUsers(
                  fetchUsers,
                  pagination,
                  searchTerm,
                  sortField,
                  sortOrder as "desc" | "asc",
                  pagination.totalPages
                )
              }
              disabled={!pagination.hasNext}
              className="px-2"
            >
              <ChevronsRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
