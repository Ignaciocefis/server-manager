import { ConfirmMessageKey, ConfirmMessageParams } from "@/components/Shared/ConfirmDialog/ConfirmDialog.types";
import { PaginationProps } from "../UsersTable/UserTable.type";

export interface UserType {
  id: string;
  userFullName: string;
  category: "ADMIN" | "RESEARCHER" | "JUNIOR";
  isActive: boolean;
  assignedToId?: string | null;
  servers?: string[];
}

export interface UserActionsDialogProps {
  user: UserType;
  isAdmin: boolean;
  isResearcher: boolean;
  fetchUsers: () => Promise<void>;
  pagination: PaginationProps;
  searchTerm: string;
  sortField: string;
  sortOrder: string;
  openConfirmDialog: <K extends ConfirmMessageKey>(
    action: () => void,
    messageKey: K,
    params: ConfirmMessageParams[K]
  ) => void;
}
