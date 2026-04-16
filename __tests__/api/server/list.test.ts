jest.mock("@/features/server/data");
jest.mock("@/lib/auth/hasCategory");
jest.mock("@/lib/services/language/getServerLanguage");
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}));

import { GET } from "@/app/api/server/list/route";
import { getUserAccessibleServers } from "@/features/server/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

describe("GET /api/server/list", () => {
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    (NextResponse.json as jest.Mock).mockImplementation((data: unknown, init?: { status?: number } | undefined) => ({ data, status: init?.status }));
    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
  });

  it("returns 400 if userId is missing from hasCategory", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: null });

    const req = {
      url: "https://example.com/api/server/list",
    } as unknown as Request;

    const res = await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.userIdRequired") },
      { status: 400 }
    );
    expect(res.status).toBe(400);
  });

  it("uses idParam from query string when provided", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "authUser" });
    (getUserAccessibleServers as jest.Mock).mockResolvedValue({
      success: true,
      data: [{ id: "srv1", name: "Server1" }],
    });

    const req = {
      url: "https://example.com/api/server/list?id=overrideUser",
    } as unknown as Request;

    await GET(req);

    expect(getUserAccessibleServers).toHaveBeenCalledWith("overrideUser");
  });

  it("returns 500 if getUserAccessibleServers fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    (getUserAccessibleServers as jest.Mock).mockResolvedValue({
      success: false,
      error: "DB error",
    });

    const req = {
      url: "https://example.com/api/server/list",
    } as unknown as Request;

    const res = await GET(req);

    expect(getUserAccessibleServers).toHaveBeenCalledWith("user1");
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        success: false,
        data: null,
        error: "DB error",
      },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 200 with server list data when successful", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    (getUserAccessibleServers as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        { id: "srv1", name: "Server1" },
        { id: "srv2", name: "Server2" },
      ],
    });

    const req = {
      url: "https://example.com/api/server/list",
    } as unknown as Request;

    const res = await GET(req);

    expect(getUserAccessibleServers).toHaveBeenCalledWith("user1");
    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        success: true,
        data: [
          { id: "srv1", name: "Server1" },
          { id: "srv2", name: "Server2" },
        ],
        error: null,
      },
      { status: 200 }
    );
    expect(res.status).toBe(200);
  });

  it("returns 500 on unexpected error (catch block)", async () => {
    (getServerLanguage as jest.Mock).mockRejectedValue(new Error("Unexpected"));

    const req = {
      url: "https://example.com/api/server/list",
    } as unknown as Request;

    const res = await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });
});
