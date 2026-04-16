import { DELETE } from "@/app/api/user/delete/route";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { getUserNameById, deleteUserById } from "@/features/user/data";
import { createEventLog } from "@/features/eventLog/data";
import { getFullName } from "@/features/user/utils";
import { NextResponse } from "next/server";

jest.mock("@/lib/auth/hasCategory");
jest.mock("@/lib/services/language/getServerLanguage");
jest.mock("@/features/user/data");
jest.mock("@/features/eventLog/data");
jest.mock("@/features/user/utils");
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}));

describe("DELETE /api/user/delete", () => {
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
    (getFullName as jest.Mock).mockImplementation((first, second, name) => `${name} ${first ?? ""} ${second ?? ""}`.trim());
  });

  it("returns 400 if userId is missing or invalid", async () => {
    const req = { json: jest.fn().mockResolvedValue({}) } as unknown as Request;
    const res = await DELETE(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: mockT("User.Route.userIdInvalid") },
      { status: 400 }
    );
    expect(res.status).toBe(400);
  });

  it("returns 403 if user is not ADMIN", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: false });
    const req = { json: jest.fn().mockResolvedValue({ userId: "user123" }) } as unknown as Request;

    const res = await DELETE(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: mockT("User.Route.unauthorized") },
      { status: 403 }
    );
    expect(res.status).toBe(403);
  });

  it("returns 404 if getUserNameById fails or has no data", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (getUserNameById as jest.Mock).mockResolvedValue({ success: false, data: null, error: "not found" });

    const req = { json: jest.fn().mockResolvedValue({ userId: "user123" }) } as unknown as Request;
    const res = await DELETE(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: mockT("User.Route.userNotFound") },
      { status: 404 }
    );
    expect(res.status).toBe(404);
  });

  it("returns 500 if createEventLog fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (getUserNameById as jest.Mock).mockResolvedValue({
      success: true,
      data: { firstSurname: "A", secondSurname: "B", name: "Test" },
    });
    (createEventLog as jest.Mock).mockResolvedValue({ error: "log error" });

    const req = { json: jest.fn().mockResolvedValue({ userId: "user123" }) } as unknown as Request;
    const res = await DELETE(req);

    expect(createEventLog).toHaveBeenCalledWith({
      eventType: "USER_DELETED",
      userId: "user123",
      message: "EventLog.logMessage.user_deleted|Test A B",
    });

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: mockT("User.Route.createEventLogError") },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 500 if deleteUserById fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (getUserNameById as jest.Mock).mockResolvedValue({
      success: true,
      data: { firstSurname: "A", secondSurname: "B", name: "Test" },
    });
    (createEventLog as jest.Mock).mockResolvedValue({ success: true });
    (deleteUserById as jest.Mock).mockResolvedValue({ success: false, error: "delete error" });

    const req = { json: jest.fn().mockResolvedValue({ userId: "user123" }) } as unknown as Request;
    const res = await DELETE(req);

    expect(deleteUserById).toHaveBeenCalledWith("user123");
    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: mockT("User.Route.userDeleteError") },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("deletes user successfully (happy path)", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (getUserNameById as jest.Mock).mockResolvedValue({
      success: true,
      data: { firstSurname: "A", secondSurname: "B", name: "Test" },
    });
    (createEventLog as jest.Mock).mockResolvedValue({ success: true });
    (deleteUserById as jest.Mock).mockResolvedValue({ success: true });

    const req = { json: jest.fn().mockResolvedValue({ userId: "user123" }) } as unknown as Request;
    const res = await DELETE(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: true, error: null },
      { status: 200 }
    );
    expect(res.status).toBe(200);
  });

  it("returns 500 on unexpected error", async () => {
    (hasCategory as jest.Mock).mockRejectedValue(new Error("Unexpected error"));
    const req = { json: jest.fn().mockResolvedValue({ userId: "user123" }) } as unknown as Request;
    const res = await DELETE(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });
});
