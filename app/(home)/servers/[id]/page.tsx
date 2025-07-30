"use client";

import { ServerDetailsContainer } from "@/features/server/components";
import { useParams } from "next/navigation";

export default function Page() {
  const { id } = useParams();

  return <ServerDetailsContainer serverId={id as string} />;
}
