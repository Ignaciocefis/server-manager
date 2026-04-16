jest.mock("@/lib/auth/hasCategory");
jest.mock("@/features/eventLog/data");
jest.mock("@/lib/services/reservations/updateStatus");
jest.mock("@/lib/services/language/getServerLanguage");
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}));

import { GET } from "@/app/api/eventLogs/list/route";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getAccessibleLogs, getAllLogs } from "@/features/eventLog/data";
import { updateGpuReservationStatuses } from "@/lib/services/reservations/updateStatus";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

describe("GET /api/eventLogs/list", () => {
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
    (updateGpuReservationStatuses as jest.Mock).mockResolvedValue({ success: true });
    (NextResponse.json as jest.Mock).mockImplementation((data: unknown, init?: { status?: number }) => ({
      data,
      status: init?.status,
    }));
  });

  it("returns 401 if user is unauthorized", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: null, isCategory: false });

    const req = { url: "http://localhost/api/eventLogs/list" } as unknown as Request;
    const res = await GET(req);

    expect(updateGpuReservationStatuses).toHaveBeenCalledTimes(1);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("EventLogs.Route.unauthorized") },
      { status: 401 }
    );
    expect(res.status).toBe(401);
  });

  it("calls getAllLogs for ADMIN and returns paginated logs", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "admin1", isCategory: true });
    (getAllLogs as jest.Mock).mockResolvedValue({
      success: true,
      error: null,
      data: {
        total: 3,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
        rows: [{ id: "log1" }],
      },
    });

    const req = {
      url: "http://localhost/api/eventLogs/list?page=2&limit=10&sortField=eventType&sortOrder=asc&filterTitle=test&type=USER_CREATED&serverId=srv1",
    } as unknown as Request;

    const res = await GET(req);

    expect(getAllLogs).toHaveBeenCalledWith(
      {
        page: 2,
        limit: 10,
        sortField: "eventType",
        sortOrder: "asc",
        filterTitle: "test",
        typeFilter: "USER_CREATED",
      },
      "srv1"
    );

    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        success: true,
        data: {
          page: 2,
          limit: 10,
          total: 3,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
          rows: [{ id: "log1" }],
        },
        error: null,
      },
      { status: 200 }
    );
    expect(res.status).toBe(200);
  });

  it("calls getAccessibleLogs for non-admin users", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1", isCategory: false });
    (getAccessibleLogs as jest.Mock).mockResolvedValue({
      success: true,
      error: null,
      data: {
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
        rows: [{ id: "log2" }],
      },
    });

    const req = { url: "http://localhost/api/eventLogs/list" } as unknown as Request;
    const res = await GET(req);

    expect(getAccessibleLogs).toHaveBeenCalledWith(
      "user1",
      undefined,
      {
        page: 1,
        limit: 20,
        sortField: "createdAt",
        sortOrder: "desc",
        filterTitle: "",
        typeFilter: "all",
      }
    );
    expect(res.status).toBe(200);
  });

  it("returns 500 when logs fetch fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "admin1", isCategory: true });
    (getAllLogs as jest.Mock).mockResolvedValue({ success: false, data: null, error: "DB error" });

    const req = { url: "http://localhost/api/eventLogs/list" } as unknown as Request;
    const res = await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: "DB error" },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 500 on unexpected error", async () => {
    (getServerLanguage as jest.Mock).mockRejectedValue(new Error("Unexpected"));

    const req = { url: "http://localhost/api/eventLogs/list" } as unknown as Request;
    const res = await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });
});
