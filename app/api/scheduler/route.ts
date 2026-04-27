import { updateGpuReservationStatuses } from "@/lib/services/reservations/updateStatus";
import { NextResponse } from "next/server";

/**
 * @openapi
 * {
 *   "description": "Triggers reservation status synchronization for GPU reservations.",
 *   "responses": {
 *     "200": {
 *       "description": "Reservation statuses updated successfully"
 *     },
 *     "500": {
 *       "description": "Failed to update reservation statuses"
 *     }
 *   }
 * }
 */
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