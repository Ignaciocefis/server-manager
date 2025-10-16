import { UserManagementContainer } from "@/features/user/components";
import { hasCategory } from "@/lib/auth/hasCategory";

export default async function Page() {
  const { isCategory } = await hasCategory("ADMIN");
  return <UserManagementContainer isAdmin={isCategory} />;
}
