import { updateUserCategory, getUserNameById } from "@/features/user/data";
import { createEventLog } from "@/features/eventLog/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { getFullName } from "@/features/user/utils";
import { NextResponse } from "next/server";
import { PUT } from "@/app/api/user/updateCategory/route";

jest.mock("@/features/user/data");
jest.mock("@/features/eventLog/data");
jest.mock("@/lib/auth/hasCategory");
jest.mock("@/lib/services/language/getServerLanguage");
jest.mock("@/features/user/utils");
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}));

describe("PUT /api/user/update/category", () => {
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
    (getFullName as jest.Mock).mockImplementation((first, second, name) => `${first ?? ""} ${second ?? ""} ${name ?? ""}`.trim());
  });

  it("returns 403 if user is not ADMIN", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: false });

    const req = { json: jest.fn().mockResolvedValue({ userId: "user123", category: "RESEARCHER" }) } as unknown as Request;

    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: mockT("User.Route.unauthorized") },
      { status: 403 }
    );
    expect(res.status).toBe(403);
  });

  it("returns 500 if updateUserCategory fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (updateUserCategory as jest.Mock).mockResolvedValue({ success: false });

    const req = { json: jest.fn().mockResolvedValue({ userId: "user123", category: "RESEARCHER" }) } as unknown as Request;

    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: mockT("User.Route.categoryUpdateFailed") },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 404 if getUserNameById fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (updateUserCategory as jest.Mock).mockResolvedValue({ success: true });
    (getUserNameById as jest.Mock).mockResolvedValue({ success: false });

    const req = { json: jest.fn().mockResolvedValue({ userId: "user123", category: "RESEARCHER" }) } as unknown as Request;

    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: mockT("User.Route.userNotFound") },
      { status: 404 }
    );
    expect(res.status).toBe(404);
  });

  it("returns 500 if createEventLog fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (updateUserCategory as jest.Mock).mockResolvedValue({ success: true });
    (getUserNameById as jest.Mock).mockResolvedValue({ success: true, data: { name: "Test", firstSurname: "User", secondSurname: "Demo" } });
    (createEventLog as jest.Mock).mockResolvedValue({ error: true });

    const req = { json: jest.fn().mockResolvedValue({ userId: "user123", category: "RESEARCHER" }) } as unknown as Request;

    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: mockT("User.Route.createEventLogError") },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 200 on successful category update", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (updateUserCategory as jest.Mock).mockResolvedValue({ success: true });
    (getUserNameById as jest.Mock).mockResolvedValue({ success: true, data: { name: "Test", firstSurname: "User", secondSurname: "Demo" } });
    (createEventLog as jest.Mock).mockResolvedValue({ success: true });

    const req = { json: jest.fn().mockResolvedValue({ userId: "user123", category: "RESEARCHER" }) } as unknown as Request;

    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: "Investigador asignado correctamente", success: true, error: null },
      { status: 200 }
    );
    expect(res.status).toBe(200);
  });

  it("returns 500 on unexpected error", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (updateUserCategory as jest.Mock).mockRejectedValue(new Error("Unexpected"));

    const req = { json: jest.fn().mockResolvedValue({ userId: "user123", category: "RESEARCHER" }) } as unknown as Request;

    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });
});
