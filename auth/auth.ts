import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import NextAuth from "next-auth"
import { Category } from "@prisma/client"
import authConfig from "./auth.config"
 
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
        session.user.category = token.category as Category
        session.user.firstSurname = token.firstSurname as string;
        session.user.secondSurname = token.secondSurname as string | undefined;
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.category = user.category
        token.firstSurname = user.firstSurname;
        token.secondSurname = user.secondSurname ?? undefined;
      }
      return token
    }
  },
  session: { strategy: "jwt" },
  ...authConfig
})