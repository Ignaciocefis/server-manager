import { useEffect, useState } from "react";
import axios from "axios";
import { UsersTableDataProps } from "../UsersTable/UserTable.type";

export function useUserManagementContainer() {
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
    fetchUsers,
  };
}
