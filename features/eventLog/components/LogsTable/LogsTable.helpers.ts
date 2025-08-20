import { LogsTableColumn, PaginationProps } from "./LogsTable.types";

export const handlePageChange = (
  fetchLogs: (page: number, limit: number, search: string, typeFilter: string, sortField: string, sortOrder: string) => void,
  pagination: PaginationProps,
  debouncedSearch: string,
  typeFilter: string,
  sortField: string,
  sortOrder: string,
  newPage: number
) => fetchLogs(newPage, pagination.limit, debouncedSearch, typeFilter, sortField, sortOrder);

export const handleLimitChange = (
  fetchLogs: (page: number, limit: number, search: string, typeFilter: string, sortField: string, sortOrder: string) => void,
  pagination: PaginationProps,
  debouncedSearch: string,
  typeFilter: string,
  sortField: string,
  sortOrder: string,
  newLimit: string
) => {
  const limit = parseInt(newLimit, 10);
  fetchLogs(1, limit, debouncedSearch, typeFilter, sortField, sortOrder);
};

export const handleSort = (
  field: string,
  sortField: string,
  setSortField: (field: string) => void,
  sortOrder: string,
  setSortOrder: (order: string) => void
) => {
  if (sortField === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  else {
    setSortField(field);
    setSortOrder("asc");
  }
};

export const handleRefresh = (
  fetchLogs: (page: number, limit: number, search: string, typeFilter: string, sortField: string, sortOrder: string) => void,
  pagination: PaginationProps,
  debouncedSearch: string,
  typeFilter: string,
  sortField: string,
  sortOrder: string
) => fetchLogs(pagination.page, pagination.limit, debouncedSearch, typeFilter, sortField, sortOrder);

export const toggleColumn = (
  columnKey: string,
  visibleColumns: LogsTableColumn[],
  setVisibleColumns: (columns: LogsTableColumn[]) => void
) => {
  setVisibleColumns(visibleColumns.map((col) => (col.key === columnKey ? { ...col, visible: !col.visible } : col)));
};
