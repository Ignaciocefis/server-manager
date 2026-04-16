jest.mock("@/features/eventLog/data");
jest.mock("@/lib/auth/hasCategory");
jest.mock("@/lib/services/language/getServerLanguage");
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}));

import { PATCH } from "@/app/api/eventLogs/notificationRead/route";
import { markNotificationAsRead } from "@/features/eventLog/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

describe("PATCH /api/eventLogs/notificationRead", () => {
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
    (NextResponse.json as jest.Mock).mockImplementation((data: unknown, init?: { status?: number }) => ({
      data,
      status: init?.status,
    }));
  });

  it("returns 401 if user is unauthorized", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: null });

    const req = { json: jest.fn().mockResolvedValue({ id: "n1" }) } as unknown as Request;
    const res = await PATCH(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("EventLogs.Route.unauthorized") },
      { status: 401 }
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 if notification id is missing or invalid", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });

    const req = { json: jest.fn().mockResolvedValue({ id: 123 }) } as unknown as Request;
    const res = await PATCH(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("EventLogs.Route.missingNotificationData") },
      { status: 400 }
    );
    expect(res.status).toBe(400);
  });

  it("returns 500 if markNotificationAsRead fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    (markNotificationAsRead as jest.Mock).mockResolvedValue({ success: false });

    const req = { json: jest.fn().mockResolvedValue({ id: "n1" }) } as unknown as Request;
    const res = await PATCH(req);

    expect(markNotificationAsRead).toHaveBeenCalledWith("n1", "user1");
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("EventLogs.Route.markNotificationError") },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 200 when notification is marked as read", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    (markNotificationAsRead as jest.Mock).mockResolvedValue({ success: true, data: null, error: null });

    const req = { json: jest.fn().mockResolvedValue({ id: "n1" }) } as unknown as Request;
    const res = await PATCH(req);

    expect(markNotificationAsRead).toHaveBeenCalledWith("n1", "user1");
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: true, data: null, error: null },
      { status: 200 }
    );
    expect(res.status).toBe(200);
  });

  it("returns 500 on unexpected error", async () => {
    (getServerLanguage as jest.Mock).mockRejectedValue(new Error("Unexpected"));

    const req = { json: jest.fn().mockResolvedValue({ id: "n1" }) } as unknown as Request;
    const res = await PATCH(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });
});
