import { UserManagementContainer } from "@/features/user/components";
import { useHasCategory } from "@/hooks/useHasCategory";

export default function Page() {
  const { hasCategory } = useHasCategory(["ADMIN"]);
  return <UserManagementContainer isAdmin={hasCategory} />;
}
