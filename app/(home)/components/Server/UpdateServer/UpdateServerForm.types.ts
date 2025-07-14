import { ServerListItem } from "../ServerList/ServerList.types";

export interface UpdateServerFormProps {
  closeDialog?: () => void;
  onUpdate?: (updatedServer: ServerListItem) => void;
  serverToEdit?: {
    available: boolean;
    id: string;
    name: string;
    ramGB: number;
    diskCount: number;
    gpus?: {
      name: string;
      type: string;
      ramGB: number;
      status: "AVAILABLE" | "IN_USE";
      userId: string | null;
    }[];
  };
}