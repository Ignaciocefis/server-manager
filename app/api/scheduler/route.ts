import { updateGpuReservationStatuses } from "@/lib/services/reservations/updateStatus";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await updateGpuReservationStatuses();

    if (!result || !result.success) {
      return NextResponse.json({ error: "Failed to update GPU reservation statuses" }, { status: 500 });
    }

    return NextResponse.json({ message: "GPU reservation statuses updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating GPU reservation statuses:", error);
    return NextResponse.json({ error: "Failed to update GPU reservation statuses" }, { status: 500 });
  }
}