import { Category } from "@prisma/client";

export interface UsersTableProps {
  id: string;
  name: string;
  firstSurname: string;
  secondSurname?: string | null;
  email: string;
  category: Category;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  assignedToId?: string | null;

  assignedTo?: {
    name: string;
    firstSurname: string;
  }
}