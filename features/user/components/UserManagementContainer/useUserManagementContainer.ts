import { useEffect, useState } from "react";
import axios from "axios";
import { UsersTableDataProps } from "@/features/user/components/UsersTable/UsersTable.data.type";

export function useUserManagementContainer() {
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

  return {
    users,
    isLoading,
    fetchUsers,
  };
}
