import { auth } from "@/auth/auth";
import { Category } from "@prisma/client";

export async function hasCategory(
  categories?: Category | Category[]
): Promise<{ userId: string | null; isCategory: boolean }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { userId: null, isCategory: false };
  }

  if (!categories) {
    return { userId: session.user.id, isCategory: false };
  }

  if (!session.user.category) {
    return { userId: session.user.id, isCategory: false };
  }

  const allowed = Array.isArray(categories) ? categories : [categories];
  return {
    userId: session.user.id,
    isCategory: allowed.includes(session.user.category),
  };
}
