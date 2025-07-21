import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import { signInSchema } from "../lib/schemas/auth/login.schema";
import { getUserByEmailWithPassword } from "@/features/user/data";

export default {
  providers: [
    Credentials({
      async authorize(credentials) {

        const validatedFields = signInSchema.safeParse(credentials);

        if (!validatedFields.success) {
          return null;
        }

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          const response = await getUserByEmailWithPassword(email);

          if (!response || !response.data || !response.data.password) {
            return null;
          }

          if (!response.data.isActive) {
            return null;
          }

          const passwordsMatch = await bcryptjs.compare(password, response.data.password);

          if (passwordsMatch) {
            return {
              ...response.data,
              secondSurname: response.data.secondSurname ?? undefined,
            };
          }
        }
      return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;