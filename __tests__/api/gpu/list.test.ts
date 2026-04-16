jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}));
jest.mock("@/features/gpu/data");
jest.mock("@/lib/auth/hasCategory");
jest.mock("@/lib/services/reservations/updateStatus");
jest.mock("@/lib/services/language/getServerLanguage");


import { GET } from "@/app/api/gpu/list/route";
import { getActiveOrFutureUserReservations } from "@/features/gpu/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { updateGpuReservationStatuses } from "@/lib/services/reservations/updateStatus";
import { NextResponse } from "next/server";

describe("GET /api/gpu/list", () => {
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
    (NextResponse.json as jest.Mock).mockImplementation((data: unknown, init?: { status?: number } | undefined) => ({ data, status: init?.status }));
    (updateGpuReservationStatuses as jest.Mock).mockResolvedValue(true);
  });

  it("returns 401 if user is unauthorized", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: null });

    const res = await GET();

    expect(res.status).toBe(401);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.unauthorized") },
      { status: 401 }
    );
  });

  it("returns 200 with data on success", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    const reservations = [{ id: "res1", gpuId: "gpu1" }];
    (getActiveOrFutureUserReservations as jest.Mock).mockResolvedValue(reservations);

    const res = await GET() as unknown as { status: number; data: { success: boolean; data: typeof reservations; error: null } };

    expect(res.status).toBe(200);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: true, data: reservations, error: null },
      { status: 200 }
    );
    expect(res.data.data).toEqual(reservations);
  });

  it("returns 500 on unexpected error", async () => {
    (getServerLanguage as jest.Mock).mockRejectedValue(new Error("Boom"));

    const res = await GET();

    expect(res.status).toBe(500);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: "Internal Server Error" },
      { status: 500 }
    );
  });
});
