"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { UsersTableDataProps } from "@/features/user/components/UsersTable/UsersTable.data.type";
import { PageTitle } from "@/components/Shared";
import { CreateUserDialog, UserTable } from "@/features/user/components";

export default function UsersManagement() {
  const [users, setUsers] = useState<UsersTableDataProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/user/list");
      setUsers(res.data.data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      <PageTitle title="Gestión de Usuarios">
        <CreateUserDialog onUserCreated={fetchUsers} />
      </PageTitle>
      <UserTable data={users} isLoading={isLoading} refetch={fetchUsers} />
    </div>
  );
}
