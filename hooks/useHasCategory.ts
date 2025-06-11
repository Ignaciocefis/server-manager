"use client";

import { Category } from "@prisma/client";
import { useSession } from "next-auth/react";

export function useHasCategory(categories: Category | Category[]): boolean {
  const { data: session, status } = useSession();

  if (status !== "authenticated") return false;

  const userCategory = session.user.category as Category;
  const allowed = Array.isArray(categories) ? categories : [categories];

  return allowed.includes(userCategory);
}