"use client";

import { PageTitle } from "@/components/Shared";
import { CreateUserDialog, UsersTable } from "@/features/user/components";
import { useUsersTable } from "../UsersTable/useUsersTable";

export function UserManagementContainer() {
  const {
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
  } = useUsersTable(10);

  return (
    <div className="flex flex-col items-center justify-center">
      <PageTitle title="Gestión de Usuarios">
        <CreateUserDialog onUserCreated={fetchUsers} />
      </PageTitle>
      <UsersTable
        users={users}
        loading={loading}
        error={error}
        pagination={pagination}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortField={sortField}
        setSortField={setSortField}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        fetchUsers={fetchUsers}
      />
    </div>
  );
}
