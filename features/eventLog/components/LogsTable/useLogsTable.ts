"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { LogsTableDataProps } from "../../types";
import { LogsTableColumn } from "./LogsTable.types";
import { INITIAL_COLUMNS } from "./LogsTable.data";

export function useLogsTable(serverId?: string, limit?: number) {
  const [logs, setLogs] = useState<LogsTableDataProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: limit || 25,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<LogsTableColumn[]>(INITIAL_COLUMNS);
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchLogs = useCallback(
    async (
      page = 1,
      limit = 25,
      search = "",
      type = "all",
      sortField = "createdAt",
      sortOrder = "desc",
    ) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`/api/eventLogs/list`, {
          params: { page, limit, filterTitle: search, type, sortField, sortOrder, serverId },
        });

        if (!data?.success) throw new Error(data?.error || "Error al cargar los logs");

        const rows: LogsTableDataProps[] = data.data?.rows ?? [];
        const total: number = data.data?.total ?? 0;
        const totalPages = Math.max(1, Math.ceil(total / limit));

        setLogs(rows);
        setPagination({
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        setLogs([]);
        setPagination((p) => ({ ...p, total: 0, totalPages: 1, hasNext: false, hasPrev: false }));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchLogs(1, pagination.limit, debouncedSearch, typeFilter, sortField, sortOrder);
  }, [debouncedSearch, fetchLogs, pagination.limit, typeFilter, sortField, sortOrder]);

  return {
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
  };
}
