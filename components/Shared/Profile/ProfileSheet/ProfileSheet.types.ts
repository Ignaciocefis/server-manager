import { Category } from "@prisma/client";

export interface ProfileSheetProps {
  user: {
    name: string;
    category: Category;
    firstSurname: string;
    secondSurname?: string;
    email: string;
  };
}