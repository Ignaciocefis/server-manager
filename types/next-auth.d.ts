// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth from "next-auth";
import { Category } from "./category";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      category: Category;
    };
  }

  interface User {
    category: Category;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    category?: Category;
  }
}
