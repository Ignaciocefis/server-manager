jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}));
jest.mock("@/features/gpu/data");
jest.mock("@/lib/auth/hasCategory");
jest.mock("@/lib/services/language/getServerLanguage");
jest.mock("@/lib/services/reservations/updateStatus");

import { GET } from "@/app/api/gpu/heatmap/route";
import { getGpuUsageByYear } from "@/features/gpu/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { updateGpuReservationStatuses } from "@/lib/services/reservations/updateStatus";
import { NextResponse } from "next/server";

describe("GET /api/gpu/heatmap", () => {
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
    (NextResponse.json as jest.Mock).mockImplementation((data: unknown, init?: { status?: number } | undefined) => ({ data, status: init?.status }));
    (updateGpuReservationStatuses as jest.Mock).mockResolvedValue(true);
  });

  it("returns 401 if user is unauthorized", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: null });

    const req = { url: "http://localhost/api/gpu/heatmap?serverId=srv1&year=2025" } as unknown as Request;
    const res = await GET(req);

    expect(res.status).toBe(401);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.unauthorized") },
      { status: 401 }
    );
  });

  it("returns 400 if serverId or year is missing", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });

    const req1 = { url: "http://localhost/api/gpu/heatmap?year=2025" } as unknown as Request;
    const res1 = await GET(req1);
    expect(res1.status).toBe(400);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.missingParameters") },
      { status: 400 }
    );

    const req2 = { url: "http://localhost/api/gpu/heatmap?serverId=srv1" } as unknown as Request;
    const res2 = await GET(req2);
    expect(res2.status).toBe(400);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.missingParameters") },
      { status: 400 }
    );
  });

  it("returns 500 if getGpuUsageByYear fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    (getGpuUsageByYear as jest.Mock).mockResolvedValue({ success: false, error: "DB error" });

    const req = { url: "http://localhost/api/gpu/heatmap?serverId=srv1&year=2025" } as unknown as Request;
    const res = await GET(req);

    expect(res.status).toBe(500);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: "DB error" },
      { status: 500 }
    );
  });

  it("returns 200 with data on success", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    const usageData = [{ month: 1, usage: 10 }];
    (getGpuUsageByYear as jest.Mock).mockResolvedValue({ success: true, data: usageData });

    const req = { url: "http://localhost/api/gpu/heatmap?serverId=srv1&year=2025" } as unknown as Request;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await GET(req) as any;

    expect(res.status).toBe(200);
    expect(res.data.data).toEqual(usageData);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: true, data: usageData, error: null },
      { status: 200 }
    );
  });

  it("returns 500 on unexpected error", async () => {
    (getServerLanguage as jest.Mock).mockRejectedValue(new Error("Boom"));
    const req = { url: "http://localhost/api/gpu/heatmap?serverId=srv1&year=2025" } as unknown as Request;
    const res = await GET(req);

    expect(res.status).toBe(500);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: "Internal Server Error" },
      { status: 500 }
    );
  });
});
