export interface GpuExtendButtonProps {
  reservationId: string;
  currentEndTime: Date;
  isExtended: boolean;
  onSuccess: () => void;
}