"use client";

import { useEffect, useState } from "react";
import { PageTitle } from "../components/PageTitle";
import { CreateUserDialog } from "./components/CreateUser";
import { UserTable } from "./components/UsersTable";
import axios from "axios";
import { UsersTableDataProps } from "./components/UsersTable/UsersTable.data.type";

export default function UsersManagement() {
  const [users, setUsers] = useState<UsersTableDataProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/users");
      setUsers(res.data);
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
