import { GET } from "@/app/api/auth/isActive/route";
import { userIsActive } from "@/features/user/data";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

jest.mock("@/features/user/data");
jest.mock("@/lib/services/language/getServerLanguage");
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}));

describe("GET /api/auth/isActive", () => {
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
  });

  describe("Positive cases", () => {
    it("returns user as active successfully", async () => {
      const url = new URL("http://localhost/api/auth/isActive?email=test@example.com");
      (userIsActive as jest.Mock).mockResolvedValue({ success: true, data: true });

      const res = await GET({ url: url.toString() } as unknown as Request);

      expect(userIsActive).toHaveBeenCalledWith("test@example.com");
      expect(NextResponse.json).toHaveBeenCalledWith(
        { data: { exists: true, isActive: true }, success: true, error: null },
        { status: 200 }
      );
      expect(res.status).toBe(200);
    });

    it("returns user as inactive successfully", async () => {
      const url = new URL("http://localhost/api/auth/isActive?email=test@example.com");
      (userIsActive as jest.Mock).mockResolvedValue({ success: true, data: false });

      const res = await GET({ url: url.toString() } as unknown as Request);

      expect(userIsActive).toHaveBeenCalledWith("test@example.com");
      expect(NextResponse.json).toHaveBeenCalledWith(
        { data: { exists: true, isActive: false }, success: true, error: null },
        { status: 200 }
      );
      expect(res.status).toBe(200);
    });
  });

  describe("Negative cases", () => {
    it("returns 400 if email param is missing", async () => {
      const url = new URL("http://localhost/api/auth/isActive");
      const res = await GET({ url: url.toString() } as unknown as Request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { data: null, success: false, error: "Auth.Route.invalidEmail" },
        { status: 400 }
      );
      expect(res.status).toBe(400);
    });

    it("returns 404 if user not found or success is false", async () => {
      const url = new URL("http://localhost/api/auth/isActive?email=test@example.com");
      (userIsActive as jest.Mock).mockResolvedValue({ success: false, data: null });

      const res = await GET({ url: url.toString() } as unknown as Request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { data: { exists: false }, success: false, error: "Auth.Route.userNotFound" },
        { status: 404 }
      );
      expect(res.status).toBe(404);
    });
  });

  describe("Error handling", () => {
    it("returns 500 on unexpected error", async () => {
      const url = new URL("http://localhost/api/auth/isActive?email=test@example.com");
      (userIsActive as jest.Mock).mockRejectedValue(new Error("Unexpected"));

      const res = await GET({ url: url.toString() } as unknown as Request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { data: null, success: false, error: "Internal Server Error" },
        { status: 500 }
      );
      expect(res.status).toBe(500);
    });
  });
});
