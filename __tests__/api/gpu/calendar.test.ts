jest.mock("@/features/gpu/data");
jest.mock("@/lib/auth/hasCategory");
jest.mock("@/lib/services/language/getServerLanguage");
jest.mock("@/lib/services/reservations/updateStatus");
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}));

import { GET } from "@/app/api/gpu/calendar/route";
import { getAccessibleReservationsByUser } from "@/features/gpu/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { updateGpuReservationStatuses } from "@/lib/services/reservations/updateStatus";
import { NextResponse } from "next/server";

describe("GET /api/gpu/calendar", () => {
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    (NextResponse.json as jest.Mock).mockImplementation((data: unknown, init?: { status?: number } | undefined) => ({ data, status: init?.status }));
    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
  });

  it("returns 401 if user is not authorized (no userId)", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: null, isCategory: false });

    const res = await GET();

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.unauthorized") },
      { status: 401 }
    );
    expect(res.status).toBe(401);
  });

  it("calls getAccessibleReservationsByUser with 'admin' if user is admin", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "adminUser", isCategory: true });
    (getAccessibleReservationsByUser as jest.Mock).mockResolvedValue({
      success: true,
      data: [{ id: "res1" }],
    });

    const res = await GET();

    expect(updateGpuReservationStatuses).toHaveBeenCalled();
    expect(getAccessibleReservationsByUser).toHaveBeenCalledWith("admin");
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: true, data: [{ id: "res1" }], error: null },
      { status: 200 }
    );
    expect(res.status).toBe(200);
  });

  it("calls getAccessibleReservationsByUser with userId if not admin", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1", isCategory: false });
    (getAccessibleReservationsByUser as jest.Mock).mockResolvedValue({
      success: true,
      data: [{ id: "res2" }],
    });

    const res = await GET();

    expect(getAccessibleReservationsByUser).toHaveBeenCalledWith("user1");
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: true, data: [{ id: "res2" }], error: null },
      { status: 200 }
    );
    expect(res.status).toBe(200);
  });

  it("returns 500 if getAccessibleReservationsByUser fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1", isCategory: false });
    (getAccessibleReservationsByUser as jest.Mock).mockResolvedValue({
      success: false,
      error: "DB error",
    });

    const res = await GET();

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: "DB error" },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 500 with translated error if getAccessibleReservationsByUser returns no error", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1", isCategory: false });
    (getAccessibleReservationsByUser as jest.Mock).mockResolvedValue({
      success: false,
      error: undefined,
    });

    const res = await GET();

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.fetchReservationsError") },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 500 on unexpected error (catch block)", async () => {
    (getServerLanguage as jest.Mock).mockRejectedValue(new Error("Unexpected"));

    const res = await GET();

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });
});
