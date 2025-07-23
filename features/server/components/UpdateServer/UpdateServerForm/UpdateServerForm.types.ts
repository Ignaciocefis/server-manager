import { ServerListItem } from "@/features/server/types";

export interface UpdateServerFormProps {
  closeDialog?: () => void;
  onUpdate?: (updatedServer: ServerListItem) => void;
  serverToEdit: {
    available: boolean;
    id: string;
    name: string;
    ramGB: number;
    diskCount: number;
    gpus?: {
      id: string;
      name: string;
      type: string;
      ramGB: number;
      userId: string | null;
    }[];
  };
}