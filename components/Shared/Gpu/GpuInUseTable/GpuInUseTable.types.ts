import { ServerListItem } from "@/app/(home)/components/Server/ServerList/ServerList.types";

export interface GpuInUseTableProps {
  data: ServerListItem[];
  isLoading: boolean;
}
