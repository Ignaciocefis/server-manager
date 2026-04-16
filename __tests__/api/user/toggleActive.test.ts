import { PATCH } from "@/app/api/user/toggleActive/route";
import { getUserNameById, toggleUserActiveStatus } from "@/features/user/data";
import { createEventLog } from "@/features/eventLog/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

jest.mock("@/features/user/data");
jest.mock("@/features/eventLog/data");
jest.mock("@/lib/auth/hasCategory");
jest.mock("@/lib/services/language/getServerLanguage");
jest.mock("@/features/user/utils", () => ({
  getFullName: jest.fn((first, second, name) => [first, second, name].filter(Boolean).join(" ")),
}));
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}));

describe("PATCH /api/user/toggleActive", () => {
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
  });

  it("returns 403 if user is not ADMIN", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: false });
    const req = { json: async () => ({ userId: "123" }), method: "PATCH", url: "http://localhost/api/user/toggleActive" } as unknown as Request;

    const res = await PATCH(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("User.Route.unauthorized") },
      { status: 403 }
    );
    expect(res.status).toBe(403);
  });

  it("returns 400 if userId is invalid", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    const req = { json: async () => ({ userId: "" }), method: "PATCH", url: "http://localhost/api/user/toggleActive" } as unknown as Request;

    const res = await PATCH(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("User.Route.userNotFound") },
      { status: 400 }
    );
    expect(res.status).toBe(400);
  });

  it("returns 500 if toggleUserActiveStatus fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (toggleUserActiveStatus as jest.Mock).mockResolvedValue({ success: false });
    const req = { json: async () => ({ userId: "123" }), method: "PATCH", url: "http://localhost/api/user/toggleActive" } as unknown as Request;

    const res = await PATCH(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("User.Route.toggleUserStatusError") },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 404 if user not found after toggle", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (toggleUserActiveStatus as jest.Mock).mockResolvedValue({ success: true, data: true });
    (getUserNameById as jest.Mock).mockResolvedValue({ success: true, data: null });
    const req = { json: async () => ({ userId: "123" }), method: "PATCH", url: "http://localhost/api/user/toggleActive" } as unknown as Request;

    const res = await PATCH(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: mockT("User.Route.userNotFound") },
      { status: 404 }
    );
    expect(res.status).toBe(404);
  });

  it("returns 500 if createEventLog fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (toggleUserActiveStatus as jest.Mock).mockResolvedValue({ success: true, data: false });
    (getUserNameById as jest.Mock).mockResolvedValue({ success: true, data: { name: "John", firstSurname: "Doe" } });
    (createEventLog as jest.Mock).mockResolvedValue(null);

    const req = { json: async () => ({ userId: "123" }), method: "PATCH", url: "http://localhost/api/user/toggleActive" } as unknown as Request;

    const res = await PATCH(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("User.Route.createEventLogError") },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 200 with data if user reactivated", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (toggleUserActiveStatus as jest.Mock).mockResolvedValue({ success: true, data: true });
    (getUserNameById as jest.Mock).mockResolvedValue({ success: true, data: { name: "John", firstSurname: "Doe" } });
    (createEventLog as jest.Mock).mockResolvedValue({ success: true });

    const req = { json: async () => ({ userId: "123" }), method: "PATCH", url: "http://localhost/api/user/toggleActive" } as unknown as Request;

    const res = await PATCH(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: true, data: true, error: null },
      { status: 200 }
    );
    expect(res.status).toBe(200);
  });

  it("returns 200 with data if user deactivated", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (toggleUserActiveStatus as jest.Mock).mockResolvedValue({ success: true, data: false });
    (getUserNameById as jest.Mock).mockResolvedValue({ success: true, data: { name: "John", firstSurname: "Doe" } });
    (createEventLog as jest.Mock).mockResolvedValue({ success: true });

    const req = { json: async () => ({ userId: "123" }), method: "PATCH", url: "http://localhost/api/user/toggleActive" } as unknown as Request;

    const res = await PATCH(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: true, data: false, error: null },
      { status: 200 }
    );
    expect(res.status).toBe(200);
  });

  it("returns 500 on unexpected error", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (toggleUserActiveStatus as jest.Mock).mockRejectedValue(new Error("Unexpected"));

    const req = { json: async () => ({ userId: "123" }), method: "PATCH", url: "http://localhost/api/user/toggleActive" } as unknown as Request;

    const res = await PATCH(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });
});
