jest.mock("@/features/eventLog/data");
jest.mock("@/lib/auth/hasCategory");
jest.mock("@/lib/services/language/getServerLanguage");
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}));

import { GET } from "@/app/api/eventLogs/notificationList/route";
import { getAllUnreadNotifications } from "@/features/eventLog/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

describe("GET /api/eventLogs/notificationList", () => {
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

    const res = await GET();

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("EventLogs.Route.unauthorized") },
      { status: 401 }
    );
    expect(res.status).toBe(401);
  });

  it("returns 500 if getAllUnreadNotifications fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    (getAllUnreadNotifications as jest.Mock).mockResolvedValue({ success: false, data: null, error: "DB error" });

    const res = await GET();

    expect(getAllUnreadNotifications).toHaveBeenCalledWith("user1");
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("EventLogs.Route.fetchNotificationsError") },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 200 with notifications when successful", async () => {
    const notifications = [{ id: "n1", message: "Test notification", isRead: false }];

    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    (getAllUnreadNotifications as jest.Mock).mockResolvedValue({ success: true, data: notifications, error: null });

    const res = await GET() as unknown as {
      status: number;
      data: { success: boolean; data: typeof notifications; error: null };
    };

    expect(getAllUnreadNotifications).toHaveBeenCalledWith("user1");
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: true, data: notifications, error: null },
      { status: 200 }
    );
    expect(res.status).toBe(200);
    expect(res.data.data).toEqual(notifications);
  });

  it("returns 500 on unexpected error", async () => {
    (getServerLanguage as jest.Mock).mockRejectedValue(new Error("Unexpected"));

    const res = await GET();

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });
});
