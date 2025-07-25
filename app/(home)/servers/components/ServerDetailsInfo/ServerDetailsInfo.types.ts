import { ServerListItem } from "@/app/(home)/components/Server/ServerList/ServerList.types";

export interface ServerDetailsInfoProps {
  server: ServerListItem;
  isAdmin: boolean;
  onUpdate: (updatedServer: ServerListItem) => void;
  onToggleAvailability: () => Promise<void>;
  onDelete: () => Promise<void>;
  onReservationSuccess: () => void;
}