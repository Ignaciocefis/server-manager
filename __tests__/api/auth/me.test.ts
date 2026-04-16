import { GET } from "@/app/api/auth/me/route";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { getUserById } from "@/features/user/data";
import { NextResponse } from "next/server";

jest.mock("@/lib/auth/hasCategory");
jest.mock("@/lib/services/language/getServerLanguage");
jest.mock("@/features/user/data");
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}));


describe("GET /api/auth/me", () => {
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();

    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
  });

  describe("Positive cases", () => {
    it("returns user data successfully when user is found", async () => {
      (hasCategory as jest.Mock).mockResolvedValue({ userId: "user123" });
      (getUserById as jest.Mock).mockResolvedValue({
        success: true,
        data: { id: "user123", name: "Test User" },
      });

      const res = await GET();

      expect(hasCategory).toHaveBeenCalled();
      expect(getUserById).toHaveBeenCalledWith("user123");
      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          data: { id: "user123", name: "Test User" },
          success: true,
          error: null,
        },
        { status: 200 }
      );

      expect(res.status).toBe(200);
    });
  });

  describe("Negative cases", () => {
    it("returns 401 if userId is missing", async () => {
      (hasCategory as jest.Mock).mockResolvedValue({ userId: null });

      const res = await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          data: null,
          success: false,
          error: "Auth.Route.unauthorized",
        },
        { status: 401 }
      );
      expect(res.status).toBe(401);
    });

    it("returns 404 if user not found or success is false", async () => {
      (hasCategory as jest.Mock).mockResolvedValue({ userId: "user123" });
      (getUserById as jest.Mock).mockResolvedValue({
        success: false,
        data: null,
      });

      const res = await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          data: { exists: false },
          success: false,
          error: "Auth.Route.userNotFound",
        },
        { status: 404 }
      );
      expect(res.status).toBe(404);
    });
  });

  describe("Error handling", () => {
    it("returns 500 on unexpected error", async () => {
      (hasCategory as jest.Mock).mockRejectedValue(new Error("Unexpected"));

      const res = await GET();

      expect(NextResponse.json).toHaveBeenCalledWith(
        {
          data: null,
          success: false,
          error: "Internal Server Error",
        },
        { status: 500 }
      );
      expect(res.status).toBe(500);
    });
  });
});
