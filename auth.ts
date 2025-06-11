import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import authConfig from "./auth.config"
import NextAuth from "next-auth"
import { Category } from "@prisma/client"
 
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
        session.user.category = token.category as Category
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.category = user.category
      }
      return token
    }
  },
  session: { strategy: "jwt" },
  ...authConfig
})