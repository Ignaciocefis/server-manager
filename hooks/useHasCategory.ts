"use client";

import { Category } from "@prisma/client";
import { useSession } from "next-auth/react";

interface UseHasCategoryResult {
  hasCategory: boolean;
  userId: string | null;
}

export function useHasCategory(
  categories: Category | Category[]
): UseHasCategoryResult {
  const { data: session, status } = useSession();

  if (status !== "authenticated" || !session?.user) {
    return { hasCategory: false, userId: null };
  }

  const userCategory = session.user.category as Category;
  const allowed = Array.isArray(categories) ? categories : [categories];

  const hasCategory = allowed.includes(userCategory);

  return {
    hasCategory,
    userId: session.user.id,
  };
}
