"use client";

import { CreateUserDialog, UsersTable } from "@/features/user/components";
import { useUsersTable } from "../UsersTable/useUsersTable";
import { User } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export function UserManagementContainer({ isAdmin }: { isAdmin: boolean }) {
  const { t } = useLanguage();

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
    <div className="w-11/12 mx-auto space-y-8">
      <div className="border rounded-xl shadow-md bg-white p-5 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-blue-app" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-app-700">
              {t("User.management.title")}
            </h1>
          </div>
          <p className="text-sm md:text-base text-gray-app-500 ml-3 pl-8">
            {t("User.management.description")}
          </p>
        </div>

        {isAdmin && <CreateUserDialog onUserCreated={fetchUsers} />}
      </div>

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
