import { Category } from "@prisma/client";

export interface UserSummary {
  id: string;
  name: string;
  firstSurname: string;
  secondSurname: string | null;
  email: string;
  category: Category;
  assignedToId: string | null;
};

export interface UserSummaryWithAssignedTo extends UserSummary {
  assignedTo?: UserSummary | null;
}

export interface UserWithPassword extends UserSummary {
  password: string;
  isActive: boolean;
};