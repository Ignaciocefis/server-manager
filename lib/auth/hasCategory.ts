import { auth } from "@/auth";
import { Category } from "@prisma/client";

export async function hasCategory(categories: Category | Category[]): Promise<boolean> {
  const session = await auth();

  if (!session?.user?.category) return false;

  const allowed = Array.isArray(categories) ? categories : [categories];
  return allowed.includes(session.user.category);
}