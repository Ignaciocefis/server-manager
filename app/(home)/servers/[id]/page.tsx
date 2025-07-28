import { ServerDetailsContainer } from "@/features/server/components";

export default function page({ params }: { params: { id: string } }) {
  return <ServerDetailsContainer serverId={params.id} />;
}
