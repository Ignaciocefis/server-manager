import { updateGpuReservationStatuses } from "@/lib/services/reservations/updateStatus";

export async function GET() {
  const result = await updateGpuReservationStatuses();

  if (!result || !result.success) {
    throw new Error("Failed to update GPU reservation statuses");
  }
}