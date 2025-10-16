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
  TriangleAlert,
  Logs,
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

import { TYPE_VARIANTS } from "../../helpers";
import { exportLogsToCSV, getNestedValue, toDisplay } from "../../utils";
import { useLogsTable } from "./useLogsTable";
import {
  handleSort,
  handleRefresh,
  toggleColumn,
  handlePageChange,
  handleLimitChange,
} from "./LogsTable.helpers";
import { useImperativeHandle, forwardRef } from "react";
import { TypeBadge } from "..";
import { useLanguage } from "@/hooks/useLanguage";

export type LogsTableHandle = {
  exportFilteredLogs: () => void;
};

export const LogsTable = forwardRef<
  LogsTableHandle,
  { serverId?: string; limit?: number }
>(({ serverId, limit }, ref) => {
  const { t, tLog } = useLanguage();

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
  } = useLogsTable(serverId, limit);

  useImperativeHandle(ref, () => ({
    exportFilteredLogs: () => {
      exportLogsToCSV(logs, tLog);
    },
  }));

  return (
    <div>
      <div className="w-full border rounded-xl shadow-md bg-white p-5 flex flex-col gap-4 -mt-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-lg border border-gray-app-200 shadow-sm bg-white mb-4">
          {serverId && (
            <div className="flex items-center gap-3">
              <Logs className="w-6 h-6 text-blue-app" />
              <h2 className="text-xl md:text-2xl font-bold text-gray-app-700">
                {t("EventLog.logsTable.title")}
              </h2>
            </div>
          )}
          <div
            className={`flex items-center gap-2 ${
              serverId ? "ml-auto" : "flex-1"
            }`}
          >
            <div className="relative max-w-sm">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={t("EventLog.logsTable.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-52">
                <SelectValue placeholder={t("EventLog.logsTable.filterType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("EventLog.logsTable.filterAll")}
                </SelectItem>
                {Object.keys(TYPE_VARIANTS).map((key) => (
                  <SelectItem key={key} value={key}>
                    {t(`EventLog.logType.${key.toLowerCase()}`)}
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
                  {t("EventLog.logsTable.filterColumns")}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {t("EventLog.logsTable.showColumns")}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {visibleColumns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.key}
                    checked={column.visible}
                    onCheckedChange={() =>
                      toggleColumn(
                        column.key,
                        visibleColumns,
                        setVisibleColumns
                      )
                    }
                  >
                    {t(column.label)}
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
              {t("EventLog.logsTable.refresh")}
            </Button>
          </div>
        </div>

        {error && (
          <div className="border rounded-xl shadow-md p-5 bg-red-50 mt-4 flex items-stretch gap-4">
            <div className="flex-shrink-0 flex items-center">
              <TriangleAlert className="w-10 h-full text-red-700" />
            </div>

            <div className="flex flex-col justify-center">
              <h3 className="text-lg md:text-2xl font-bold text-red-700">
                {t("EventLog.logsTable.errorLoading")}
              </h3>
              <p className="text-sm md:text-base text-red-app">{error}</p>
            </div>
          </div>
        )}

        <div className="border border-border rounded-lg overflow-hidden">
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
                        {t(column.label)}
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
                      {t("EventLog.logsTable.loading")}
                    </div>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumns.filter((col) => col.visible).length}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {t("EventLog.logsTable.noLogs")}
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
                          content = <TypeBadge type={log.eventType} />;
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
                          const translatedMessage = tLog(log.message);

                          content = (
                            <span
                              className="max-w-xs truncate block"
                              title={translatedMessage}
                            >
                              {translatedMessage}
                            </span>
                          );
                        } else {
                          const value = toDisplay(
                            getNestedValue(log, column.key)
                          );
                          content = value || <span>-</span>;
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
      </div>
      <div className="flex flex-wrap mt-2 border rounded-xl shadow-md bg-white sm:flex-row items-center justify-between p-4 rounded-b-lg gap-2">
        <div className="text-sm text-muted-foreground">
          {t("EventLog.logsTable.paginationShowing")}{" "}
          <span className="font-medium">
            {(pagination.page - 1) * pagination.limit + 1}
          </span>{" "}
          {t("EventLog.logsTable.paginationTo")}{" "}
          <span className="font-medium">
            {Math.min(pagination.page * pagination.limit, pagination.total)}
          </span>{" "}
          {t("EventLog.logsTable.paginationOf")}{" "}
          <span className="font-medium">{pagination.total}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t("EventLog.logsTable.paginationShowing")}
            </span>
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
});

LogsTable.displayName = "LogsTable";
