export type ConfirmMessageKey =
  | "delete_user"
  | "activate_user"
  | "update_server"
  | "server_availability"
  | "delete_server"
  | "cancel_reservation"
  | "confirm_reservation"
  | "extend_reservation"
  | "markAllNotificationsRead";

export type ConfirmMessageParams = {
  delete_user: { userName: string };
  activate_user: { userName: string, active: boolean };
  update_server: { name: string };
  server_availability: { name: string; available: boolean };
  delete_server: { name: string };
  cancel_reservation: { gpu: string; server: string; date: string };
  confirm_reservation: { gpus: string[]; dateRange: string };
  extend_reservation: { hours: number };
  markAllNotificationsRead: undefined;
};

export type IconType = "warning" | "error" | "info";

export interface ConfirmDialogProps<K extends ConfirmMessageKey = ConfirmMessageKey> {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  messageKey: K;
  params?: ConfirmMessageParams[K];
}
