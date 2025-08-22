import { LogsTableDataProps } from "../../types";

export interface LogsTableProps {
  data: LogsTableDataProps[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    search: string;
    type: string;
  };
}

export type LogsTableColumn = { key: string; label: string; visible: boolean };

export interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};