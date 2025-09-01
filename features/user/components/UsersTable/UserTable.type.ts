import { Category } from "@prisma/client";
import { UserSummary } from "../../types";

export type UsersTableProps = {
  users: UsersTableDataProps[];
  loading: boolean;
  error: string | null;
  pagination: PaginationProps;
  visibleColumns: { key: string; label: string; visible: boolean }[];
  setVisibleColumns: (columns: UsersTableColumn[]) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortField: string;
  setSortField: (field: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
  fetchUsers: () => Promise<void>;
};

export interface UsersWithRelations extends UserSummary {
  isActive: boolean;
  assignedTo: {
    id: string;
    name: string;
    firstSurname: string;
    email: string;
    category: Category;
  } | null;
  serverAccess?: {
    server: {
      name: string;
    };
  }[] | null;
};

export interface UsersTableDataProps {
  id: string;
  userFullName: string;
  email: string;
  category: Category;
  isActive: boolean;
  assignedToFullName: string | undefined;
  assignedToId: string | undefined;
  servers?: string[];
}

export type UsersTableColumn = { key: string; label: string; visible: boolean };

export interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};
