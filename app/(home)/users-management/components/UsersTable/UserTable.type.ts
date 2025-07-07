import { UsersTableDataProps } from "./UsersTable.data.type";

export interface UserTableProps {
  data: UsersTableDataProps[];
  isLoading: boolean;
  refetch: () => void;
}