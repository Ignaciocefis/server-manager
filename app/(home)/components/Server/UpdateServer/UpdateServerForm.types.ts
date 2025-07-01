import { ServerListItem } from "../ServerList/ServerList.types";

export interface EditServerFormProps {
  closeDialog?: () => void;
  onUpdate?: (updatedServer: ServerListItem) => void;
  serverToEdit?: {
    available: boolean;
    id: string;
    name: string;
    ramGB: number;
    diskCount: number;
  };
}