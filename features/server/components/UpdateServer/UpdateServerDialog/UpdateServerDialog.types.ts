import { ServerListItem } from "../../../../../features/server/components/ServerList/ServerList.types";

export interface UpdateServerDialogProps {
  serverToEdit: ServerListItem;
  onUpdate?: (updatedServer: ServerListItem) => void;
  
}
