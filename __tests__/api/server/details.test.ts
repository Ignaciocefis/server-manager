jest.mock("@/features/server/data");
jest.mock("@/lib/auth/hasCategory");
jest.mock("@/lib/services/language/getServerLanguage");
jest.mock("@/lib/services/reservations/updateStatus");
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}));

import { GET } from "@/app/api/server/details/route";
import {
  getServerByIdWithReservations,
  hasAccessToServer,
} from "@/features/server/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { updateGpuReservationStatuses } from "@/lib/services/reservations/updateStatus";
import { NextResponse } from "next/server";

describe("GET /api/server/details", () => {
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    (NextResponse.json as jest.Mock).mockImplementation((data: unknown, init?: { status?: number } | undefined) => ({ data, status: init?.status }));
    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
  });

  it("returns 400 if serverId is missing or invalid", async () => {
    const req = {
      url: "https://example.com/api/server/details",
    } as unknown as Request;

    const res = await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.serverIdRequired") },
      { status: 400 }
    );
    expect(res.status).toBe(400);
  });

  it("returns 401 if user not authenticated", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: null });
    const req = {
      url: "https://example.com/api/server/details?serverId=srv1",
    } as unknown as Request;

    const res = await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.unauthorized") },
      { status: 401 }
    );
    expect(res.status).toBe(401);
  });

  it("returns 404 if server not found", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    (getServerByIdWithReservations as jest.Mock).mockResolvedValue(null);

    const req = {
      url: "https://example.com/api/server/details?serverId=srv1",
    } as unknown as Request;

    const res = await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.serverNotFound") },
      { status: 404 }
    );
    expect(res.status).toBe(404);
  });

  it("returns 403 if user has no access to server", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    (getServerByIdWithReservations as jest.Mock).mockResolvedValue({ id: "srv1", name: "Server1" });
    (hasAccessToServer as jest.Mock).mockResolvedValue(false);

    const req = {
      url: "https://example.com/api/server/details?serverId=srv1",
    } as unknown as Request;

    const res = await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.accessDenied") },
      { status: 403 }
    );
    expect(res.status).toBe(403);
  });

  it("returns 200 with server data when user has access", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    (getServerByIdWithReservations as jest.Mock).mockResolvedValue({
      id: "srv1",
      name: "Server1",
      gpus: [],
    });
    (hasAccessToServer as jest.Mock).mockResolvedValue(true);

    const req = {
      url: "https://example.com/api/server/details?serverId=srv1",
    } as unknown as Request;

    const res = await GET(req);

    expect(updateGpuReservationStatuses).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: true, data: { id: "srv1", name: "Server1", gpus: [] }, error: null },
      { status: 200 }
    );
    expect(res.status).toBe(200);
  });

  it("returns 500 on unexpected error", async () => {
    (getServerLanguage as jest.Mock).mockRejectedValue(new Error("Unexpected"));
    const req = {
      url: "https://example.com/api/server/details?serverId=srv1",
    } as unknown as Request;

    const res = await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });
});
