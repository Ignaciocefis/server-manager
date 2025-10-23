"use client";

import { LogsContainer } from "@/features/eventLog/components";
import { useHasCategory } from "@/hooks/useHasCategory";

export default function Page() {
  const { hasCategory } = useHasCategory(["ADMIN"]);
  return <LogsContainer isAdmin={hasCategory} />;
}
