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

import { TYPE_TRANSLATIONS, TYPE_VARIANTS } from "../../helpers";
import { getNestedValue, getTypeBadge, toDisplay } from "../../utils";
import { useLogsTable } from "./useLogsTable";
import {
  handleSort,
  handleRefresh,
  toggleColumn,
  handlePageChange,
  handleLimitChange,
} from "./LogsTable.helpers";

export function LogsTable() {
  const {
    logs,
    loading,
    error,
    pagination,
    visibleColumns,
    setVisibleColumns,
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    fetchLogs,
  } = useLogsTable();

  return (
    <div className="space-y-4 w-11/12 mx-auto mb-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar en logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {Object.keys(TYPE_VARIANTS).map((key) => (
                <SelectItem key={key} value={key}>
                  {TYPE_TRANSLATIONS[key] ?? key.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                    toggleColumn(column.key, visibleColumns, setVisibleColumns)
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
              handleRefresh(
                fetchLogs,
                pagination,
                searchTerm,
                typeFilter,
                sortField,
                sortOrder
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
                      handleSort(
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
                    Cargando logs...
                  </div>
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.filter((col) => col.visible).length}
                  className="text-center py-8 text-muted-foreground"
                >
                  No se encontraron logs
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, idx) => (
                <TableRow
                  key={log.id}
                  className={`hover:bg-muted/40 focus-within:bg-muted/50 ${
                    idx % 2 === 0 ? "even:bg-muted/30" : ""
                  }`}
                >
                  {visibleColumns
                    .filter((col) => col.visible)
                    .map((column) => {
                      let content: React.ReactNode;

                      if (column.key === "eventType") {
                        content = getTypeBadge(log.eventType);
                      } else if (column.key === "createdAt") {
                        content = (
                          <time
                            dateTime={log.createdAt}
                            className="font-mono text-xs"
                          >
                            {log.createdAt}
                          </time>
                        );
                      } else if (column.key === "message") {
                        content = (
                          <span
                            className="max-w-xs truncate block"
                            title={log.message}
                          >
                            {log.message}
                          </span>
                        );
                      } else {
                        content = toDisplay(getNestedValue(log, column.key));
                      }

                      return (
                        <TableCell key={column.key} className="px-4 py-2">
                          {content}
                        </TableCell>
                      );
                    })}
                </TableRow>
              ))
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
                handleLimitChange(
                  fetchLogs,
                  pagination,
                  searchTerm,
                  typeFilter,
                  sortField,
                  sortOrder,
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
                handlePageChange(
                  fetchLogs,
                  pagination,
                  searchTerm,
                  typeFilter,
                  sortField,
                  sortOrder,
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
                handlePageChange(
                  fetchLogs,
                  pagination,
                  searchTerm,
                  typeFilter,
                  sortField,
                  sortOrder,
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
                handlePageChange(
                  fetchLogs,
                  pagination,
                  searchTerm,
                  typeFilter,
                  sortField,
                  sortOrder,
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
                handlePageChange(
                  fetchLogs,
                  pagination,
                  searchTerm,
                  typeFilter,
                  sortField,
                  sortOrder,
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
