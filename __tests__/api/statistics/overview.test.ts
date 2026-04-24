jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}));
jest.mock("@/features/statistics/data");
jest.mock("@/lib/auth/hasCategory");
jest.mock("@/lib/services/language/getServerLanguage");

import { GET } from "@/app/api/statistics/overview/route";
import { getStatisticsOverview } from "@/features/statistics/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

describe("GET /api/statistics/overview", () => {
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
    (NextResponse.json as jest.Mock).mockImplementation(
      (data: unknown, init?: { status?: number }) => ({ data, status: init?.status })
    );
  });

  it("returns 401 if user is unauthorized", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: null, isCategory: false });

    const req = {
      url: "https://example.com/api/statistics/overview",
    } as unknown as Request;

    const res = await GET(req);

    expect(hasCategory).toHaveBeenCalledWith(["ADMIN"]);
    expect(res.status).toBe(401);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Auth.Route.unauthorized") },
      { status: 401 }
    );
    expect(getStatisticsOverview).not.toHaveBeenCalled();
  });

  it("returns 200 with overview data and normalized date range", async () => {
    const overviewData = {
      scope: "accessible",
      totalServers: 4,
      availableServers: 3,
      totalGpus: 10,
      activeReservations: 2,
      pendingReservations: 1,
      completedReservations: 7,
      cancelledReservations: 0,
      usersByCategory: [],
      reservationStatus: [],
      activitySeries: [],
      topServers: [],
      topUsers: [],
      recentEvents: [],
    };

    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user-1", isCategory: false });
    (getStatisticsOverview as jest.Mock).mockResolvedValue(overviewData);

    const req = {
      url: "https://example.com/api/statistics/overview?startDate=2026-06-10&endDate=2026-06-01",
    } as unknown as Request;

    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(getStatisticsOverview).toHaveBeenCalledTimes(1);

    const callArgs = (getStatisticsOverview as jest.Mock).mock.calls[0];
    expect(callArgs[0]).toBe("user-1");
    expect(callArgs[1]).toBe(false);
    expect(callArgs[2]).toEqual({
      startDate: new Date("2026-06-01T00:00:00"),
      endDate: new Date("2026-06-10T00:00:00"),
    });

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: true, data: overviewData, error: null },
      { status: 200 }
    );
  });

  it("ignores invalid dates and passes undefined range values", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "admin-1", isCategory: true });
    (getStatisticsOverview as jest.Mock).mockResolvedValue({
      scope: "global",
      totalServers: 0,
      availableServers: 0,
      totalGpus: 0,
      activeReservations: 0,
      pendingReservations: 0,
      completedReservations: 0,
      cancelledReservations: 0,
      usersByCategory: [],
      reservationStatus: [],
      activitySeries: [],
      topServers: [],
      topUsers: [],
      recentEvents: [],
    });

    const req = {
      url: "https://example.com/api/statistics/overview?startDate=invalid-date",
    } as unknown as Request;

    await GET(req);

    const callArgs = (getStatisticsOverview as jest.Mock).mock.calls[0];
    expect(callArgs[0]).toBe("admin-1");
    expect(callArgs[1]).toBe(true);
    expect(callArgs[2]).toEqual({
      startDate: undefined,
      endDate: undefined,
    });
  });

  it("returns 500 on unexpected error", async () => {
    (getServerLanguage as jest.Mock).mockRejectedValue(new Error("Boom"));

    const req = {
      url: "https://example.com/api/statistics/overview",
    } as unknown as Request;

    const res = await GET(req);

    expect(res.status).toBe(500);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: "Internal Server Error" },
      { status: 500 }
    );
  });
});
