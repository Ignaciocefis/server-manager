jest.mock("@/features/server/data");
jest.mock("@/features/eventLog/data");
jest.mock("@/lib/services/language/getServerLanguage");
jest.mock("@/lib/auth/hasCategory");
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}));

import { PUT } from "@/app/api/server/availability/route";
import { hasCategory } from "@/lib/auth/hasCategory";
import { changeServerAvailability, getServerByIdWithReservations } from "@/features/server/data";
import { createEventLog } from "@/features/eventLog/data";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

describe("PUT /api/server/availability", () => {
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (NextResponse.json as jest.Mock).mockImplementation((data: any, init?: any) => ({ data, status: init?.status }));
    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
  });

  it("returns 403 if user is not authorized", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: false });

    const req = { json: jest.fn().mockResolvedValue({ serverId: "srv1" }) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.unauthorized") },
      { status: 403 }
    );
    expect(res.status).toEqual(403);
  });

  it("returns 400 if request body is invalid", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });

    const req = { json: jest.fn().mockResolvedValue({ serverId: 123 }) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.serverIdRequired") },
      { status: 400 }
    );
    expect(res.status).toEqual(400);
  });

  it("returns 500 if changeServerAvailability fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (changeServerAvailability as jest.Mock).mockResolvedValue({ success: false });

    const req = { json: jest.fn().mockResolvedValue({ serverId: "srv1" }) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.updateServerError") },
      { status: 500 }
    );
    expect(res.status).toEqual(500);
  });

  it("returns 404 if server not found", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (changeServerAvailability as jest.Mock).mockResolvedValue({ success: true, data: true });
    (getServerByIdWithReservations as jest.Mock).mockResolvedValue({ success: false });

    const req = { json: jest.fn().mockResolvedValue({ serverId: "srv1" }) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.serverNotFound") },
      { status: 404 }
    );
    expect(res.status).toEqual(404);
  });

  it("returns 500 if createEventLog fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (changeServerAvailability as jest.Mock).mockResolvedValue({ success: true, data: true });
    (getServerByIdWithReservations as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: "srv1", name: "Server1", available: true },
    });
    (createEventLog as jest.Mock).mockResolvedValue({ error: true });

    const req = { json: jest.fn().mockResolvedValue({ serverId: "srv1" }) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.eventLogError") },
      { status: 500 }
    );
    expect(res.status).toEqual(500);
  });

  it("returns 200 on successful availability change and log creation", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (changeServerAvailability as jest.Mock).mockResolvedValue({ success: true, data: true });
    (getServerByIdWithReservations as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: "srv1", name: "Server1", available: true },
    });
    (createEventLog as jest.Mock).mockResolvedValue({ success: true });

    const req = { json: jest.fn().mockResolvedValue({ serverId: "srv1" }) } as unknown as Request;
    const res = await PUT(req);

    expect(createEventLog).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "SERVER_AVAILABLE",
        message: expect.stringContaining("server_available"),
        serverId: "srv1",
      })
    );

    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        success: true,
        data: { id: "srv1", name: "Server1", available: true },
        error: null,
      },
      { status: 200 }
    );
    expect(res.status).toEqual(200);
  });

  it("returns 500 on unexpected error", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (changeServerAvailability as jest.Mock).mockRejectedValue(new Error("Unexpected"));

    const req = { json: jest.fn().mockResolvedValue({ serverId: "srv1" }) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
    expect(res.status).toEqual(500);
  });
});
