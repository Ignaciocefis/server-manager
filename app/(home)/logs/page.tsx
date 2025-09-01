import { LogsContainer } from "@/features/eventLog/components";
import { hasCategory } from "@/lib/auth/hasCategory";

export default async function Page() {
  const { isCategory } = await hasCategory("ADMIN");
  return <LogsContainer isAdmin={isCategory} />;
}
