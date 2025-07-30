export interface GpuExtendButtonProps {
  reservationId: string;
  currentendDate: Date;
  isExtended: boolean;
  onSuccess: () => void;
}