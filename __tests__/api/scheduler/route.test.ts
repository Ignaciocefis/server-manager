jest.mock("@/lib/services/reservations/updateStatus");
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}));

import { GET } from "@/app/api/scheduler/route";
import { updateGpuReservationStatuses } from "@/lib/services/reservations/updateStatus";
import { NextResponse } from "next/server";

describe("GET /api/scheduler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NextResponse.json as jest.Mock).mockImplementation((data: unknown, init?: { status?: number }) => ({
      data,
      status: init?.status,
    }));
  });

  it("returns 200 when GPU reservation statuses are updated successfully", async () => {
    (updateGpuReservationStatuses as jest.Mock).mockResolvedValue({ success: true });

    const res = await GET();

    expect(updateGpuReservationStatuses).toHaveBeenCalledTimes(1);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { message: "GPU reservation statuses updated successfully" },
      { status: 200 }
    );
    expect(res.status).toBe(200);
  });

  it("returns 500 when status update result is unsuccessful", async () => {
    (updateGpuReservationStatuses as jest.Mock).mockResolvedValue({ success: false });

    const res = await GET();

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Failed to update GPU reservation statuses" },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 500 when updateGpuReservationStatuses throws", async () => {
    (updateGpuReservationStatuses as jest.Mock).mockRejectedValue(new Error("Boom"));

    const res = await GET();

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "Failed to update GPU reservation statuses" },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });
});
