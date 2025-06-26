// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from "next-auth";
import { Category } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      category: Category;
      firstSurname: string;
      secondSurname?: string;
    };
  }

  interface User {
    category: Category;
    firstSurname: string;
    secondSurname?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    category?: Category;
    firstSurname: string;
    secondSurname?: string;
  }
}
