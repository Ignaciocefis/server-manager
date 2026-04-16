import { GET } from "@/app/api/user/researcher/allResearchers/route";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { getAllResearchers } from "@/features/user/data";
import { NextResponse } from "next/server";

jest.mock("@/lib/auth/hasCategory");
jest.mock("@/lib/services/language/getServerLanguage");
jest.mock("@/features/user/data");
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}));

describe("GET /api/user/researcher/allResearchers", () => {
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
  });

  it("returns 403 if user is not ADMIN", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: false });

    const res = await GET();

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("User.Route.unauthorized") },
      { status: 403 }
    );
    expect(res.status).toBe(403);
  });

  it("returns 200 with researchers if successful", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (getAllResearchers as jest.Mock).mockResolvedValue({ success: true, data: ["res1", "res2"], error: null });

    const res = await GET();

    expect(getAllResearchers).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: true, data: ["res1", "res2"], error: null },
      { status: 200 }
    );
    expect(res.status).toBe(200);
  });

  it("returns 500 if getAllResearchers fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (getAllResearchers as jest.Mock).mockResolvedValue({ success: false, data: null, error: "DB error" });

    const res = await GET();

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: "DB error" },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 500 on unexpected error", async () => {
    (hasCategory as jest.Mock).mockRejectedValue(new Error("Unexpected"));

    const res = await GET();

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });
});
