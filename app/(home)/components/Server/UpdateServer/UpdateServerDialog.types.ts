import { ServerListItem } from "../ServerList/ServerList.types";

export interface UpdateServerDialogProps {
  serverToEdit: ServerListItem;
  onUpdate?: (updatedServer: ServerListItem) => void;
  
}
