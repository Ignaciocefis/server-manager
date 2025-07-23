import { ServerListItem } from "@/features/server/types";

export interface UseServerDetailsResult {
  server: ServerListItem | null;
  loading: boolean;
  error: string;
  isAdmin: boolean;
  triggerRefresh: () => void;
  setServer: (server: ServerListItem) => void;
}
