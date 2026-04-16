/* eslint-disable @typescript-eslint/no-explicit-any */
import { GET } from "@/app/api/user/researcher/findResearcher/route";
import { getUserNameById } from "@/features/user/data";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

jest.mock("@/features/user/data");
jest.mock("@/lib/services/language/getServerLanguage");
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}));

if (typeof (globalThis as any).Request === "undefined") {
  class TestRequest {
    url: string;
    constructor(url: string) {
      this.url = url;
    }
  }
  (globalThis as any).Request = TestRequest;
}

describe("GET /api/user/researcher/findResearcher", () => {
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
  });

  it("returns 400 if id is missing", async () => {
    const req = new Request("http://localhost/api/user/researcher/findResearcher");

    const res = await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("User.Route.userNotFound") },
      { status: 400 }
    );
    expect(res.status).toBe(400);
  });

  it("returns 500 if getUserNameById fails", async () => {
    const req = new Request("http://localhost/api/user/researcher/findResearcher?id=123");
    (getUserNameById as jest.Mock).mockResolvedValue({ success: false, data: null, error: "DB error" });

    const res = await GET(req);

    expect(getUserNameById).toHaveBeenCalledWith("123");
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: "DB error" },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 404 if user not found", async () => {
    const req = new Request("http://localhost/api/user/researcher/findResearcher?id=123");
    (getUserNameById as jest.Mock).mockResolvedValue({ success: true, data: null });

    const res = await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("User.Route.userNotFound") },
      { status: 404 }
    );
    expect(res.status).toBe(404);
  });

  it("returns 200 with user data if successful", async () => {
    const req = new Request("http://localhost/api/user/researcher/findResearcher?id=123");
    const userData = { id: "123", name: "John Doe" };
    (getUserNameById as jest.Mock).mockResolvedValue({ success: true, data: userData });

    const res = await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: true, data: userData, error: null },
      { status: 200 }
    );
    expect(res.status).toBe(200);
  });

  it("returns 500 on unexpected error", async () => {
    const req = new Request("http://localhost/api/user/researcher/findResearcher?id=123");
    (getUserNameById as jest.Mock).mockRejectedValue(new Error("Unexpected"));

    const res = await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });
});
