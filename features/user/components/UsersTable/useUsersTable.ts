"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { UsersTableColumn, UsersTableDataProps } from "./UserTable.type";

export const INITIAL_COLUMNS: UsersTableColumn[] = [
  { key: "userFullName", label: "Nombre", visible: true },
  { key: "email", label: "Correo", visible: true },
  { key: "assignedToFullName", label: "Asignado", visible: true },
  { key: "servers", label: "Servidores", visible: true },
  { key: "category", label: "Categoría", visible: true },
  { key: "status", label: "Estado", visible: true },
  { key: "actions", label: "Acciones", visible: true },
];

export function useUsersTable(limit?: number) {
  const [users, setUsers] = useState<UsersTableDataProps[]>([]);
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
  const [visibleColumns, setVisibleColumns] = useState<UsersTableColumn[]>(INITIAL_COLUMNS);
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchUsers = useCallback(
    async (
      page = 1,
      limit = 25,
      search = "",
      sortField = "userFullName",
      sortOrder = "desc",
    ) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`/api/user/list`, {
          params: { page, limit, filterTitle: search, sortField, sortOrder },
        });

        if (!data?.success) throw new Error(data?.error || "Error al cargar los usuarios");

        console.log("Fetched users:", data);

        const rows: UsersTableDataProps[] = data.data?.rows ?? [];
        const total: number = data.data?.total ?? 0;
        const totalPages = Math.max(1, Math.ceil(total / limit));

        setUsers(rows);
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
        setUsers([]);
        setPagination((p) => ({ ...p, total: 0, totalPages: 1, hasNext: false, hasPrev: false }));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchUsers(1, pagination.limit, debouncedSearch, sortField, sortOrder);
  }, [debouncedSearch, fetchUsers, pagination.limit, sortField, sortOrder]);

  return {
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
  };
}
