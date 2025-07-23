import { ServerListItem } from "@/features/server/components/ServerList/ServerList.types";

export interface GpuInUseTableProps {
  data: ServerListItem[];
  isLoading: boolean;
}
