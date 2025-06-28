import { Category } from "@prisma/client";

export interface ProfileSheetProps {
  user: {
    id: string;
    name: string;
    category: Category;
    firstSurname: string;
    secondSurname?: string;
    email: string;
    assignedToId?: string | null;
  };
}