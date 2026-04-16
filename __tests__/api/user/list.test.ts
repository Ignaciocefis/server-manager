import { GET } from "@/app/api/user/list/route";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { getUserById, getAssignedUsers } from "@/features/user/data";
import { NextResponse } from "next/server";

jest.mock("@/lib/auth/hasCategory");
jest.mock("@/lib/services/language/getServerLanguage");
jest.mock("@/features/user/data");
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}));

describe("GET /api/user/list", () => {
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
  });

  const createRequest = (url: string) =>
    ({ url, json: jest.fn() } as unknown as Request);

  it("returns 401 if userId is missing", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: null, isCategory: false });
    const req = createRequest("http://localhost/api/user/list");
    const res = await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("User.Route.unauthorized") },
      { status: 401 }
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 if user has no category", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1", isCategory: false });
    const req = createRequest("http://localhost/api/user/list");
    const res = await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("User.Route.unauthorized") },
      { status: 403 }
    );
    expect(res.status).toBe(403);
  });

  it("returns 500 if getUserById fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1", isCategory: true });
    (getUserById as jest.Mock).mockResolvedValue({ success: false, data: null, error: "not found" });

    const req = createRequest("http://localhost/api/user/list");
    const res = await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: "not found" },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("calls getAssignedUsers with 'all' for ADMIN and returns users", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "admin1", isCategory: true });
    (getUserById as jest.Mock).mockResolvedValue({ success: true, data: { id: "admin1", category: "ADMIN" } });
    (getAssignedUsers as jest.Mock).mockResolvedValue({ success: true, data: ["user1"], error: null });

    const req = createRequest("http://localhost/api/user/list?page=2&limit=10&sortField=name&sortOrder=asc&filterTitle=test");
    const res = await GET(req);

    expect(getAssignedUsers).toHaveBeenCalledWith("all", {
      page: 2,
      limit: 10,
      sortField: "name",
      sortOrder: "asc",
      filterTitle: "test",
    });

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: true, data: ["user1"], error: null },
      { status: 200 }
    );
    expect(res.status).toBe(200);
  });

  it("calls getAssignedUsers with userId for RESEARCHER and returns users", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "res1", isCategory: true });
    (getUserById as jest.Mock).mockResolvedValue({ success: true, data: { id: "res1", category: "RESEARCHER" } });
    (getAssignedUsers as jest.Mock).mockResolvedValue({ success: true, data: ["user2"], error: null });

    const req = createRequest("http://localhost/api/user/list");
    const res = await GET(req);

    expect(getAssignedUsers).toHaveBeenCalledWith("res1", expect.any(Object));
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: true, data: ["user2"], error: null },
      { status: 200 }
    );
    expect(res.status).toBe(200);
  });

  it("returns 500 if getAssignedUsers fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "admin1", isCategory: true });
    (getUserById as jest.Mock).mockResolvedValue({ success: true, data: { id: "admin1", category: "ADMIN" } });
    (getAssignedUsers as jest.Mock).mockResolvedValue({ success: false, data: null, error: "fetch error" });

    const req = createRequest("http://localhost/api/user/list");
    const res = await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: "fetch error" },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 403 if usersResult is undefined", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1", isCategory: true });
    (getUserById as jest.Mock).mockResolvedValue({ success: true, data: { id: "user1", category: "OTHER" } });

    const req = createRequest("http://localhost/api/user/list");
    const res = await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("User.Route.unauthorized") },
      { status: 403 }
    );
    expect(res.status).toBe(403);
  });

  it("returns 500 on unexpected error", async () => {
    (hasCategory as jest.Mock).mockRejectedValue(new Error("Unexpected"));
    const req = createRequest("http://localhost/api/user/list");
    const res = await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });
});
