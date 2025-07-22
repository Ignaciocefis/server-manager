import { Category } from "@prisma/client";

export interface UsersTableDataProps {
  id: string;
  name: string;
  firstSurname: string;
  secondSurname?: string | null;
  email: string;
  category: Category;
  isActive: boolean;
  assignedToId?: string | null;

  assignedTo?: {
    name: string;
    firstSurname: string;
  }
}