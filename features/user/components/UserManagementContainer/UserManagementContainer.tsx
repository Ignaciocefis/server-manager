"use client";

import { PageTitle } from "@/components/Shared";
import { CreateUserDialog, UserTable } from "@/features/user/components";
import { useUserManagementContainer } from "./useUserManagementContainer";

export function UserManagementContainer() {
  const { users, isLoading, fetchUsers } = useUserManagementContainer();

  return (
    <div className="flex flex-col items-center justify-center">
      <PageTitle title="Gestión de Usuarios">
        <CreateUserDialog onUserCreated={fetchUsers} />
      </PageTitle>
      <UserTable data={users} isLoading={isLoading} refetch={fetchUsers} />
    </div>
  );
}
