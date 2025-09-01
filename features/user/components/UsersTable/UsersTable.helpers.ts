import { PaginationProps, UsersTableColumn } from "./UserTable.type";

export const toggleColumnUsers = (
  columnKey: string,
  visibleColumns: UsersTableColumn[],
  setVisibleColumns: (columns: UsersTableColumn[]) => void
) => {
  setVisibleColumns(visibleColumns.map((col) => (col.key === columnKey ? { ...col, visible: !col.visible } : col)));
};

export const handleRefreshUsers = (
  fetchUsers: (page: number, limit: number, search: string, sortField: string, sortOrder: string) => void,
  pagination: PaginationProps,
  debouncedSearch: string,
  sortField: string,
  sortOrder: string
) => fetchUsers(pagination.page, pagination.limit, debouncedSearch, sortField, sortOrder);

export const handleSortUsers = (
  field: string,
  sortField: string,
  setSortField: (field: string) => void,
  sortOrder: "asc" | "desc",
  setSortOrder: (order: "asc" | "desc") => void
) => {
  if (sortField === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  else {
    setSortField(field);
    setSortOrder("asc");
  }
};

export const handlePageChangeUsers = (
  fetchUsers: (page: number, limit: number, search: string, sortField: string, sortOrder: string) => void,
  pagination: PaginationProps,
  debouncedSearch: string,
  sortField: string,
  sortOrder: string,
  newPage: number
) => fetchUsers(newPage, pagination.limit, debouncedSearch, sortField, sortOrder);

export const handleLimitChangeUsers = (
  fetchUsers: (page: number, limit: number, search: string, sortField: string, sortOrder: string) => void,
  pagination: PaginationProps,
  debouncedSearch: string,
  sortField: string,
  sortOrder: string,
  newLimit: string
) => {
  const limit = parseInt(newLimit, 10);
  fetchUsers(1, limit, debouncedSearch, sortField, sortOrder);
};