import { getUserNameById, userRecoverPassword } from "@/features/user/data";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { generateRandomPassword } from "@/lib/auth/generatePassword";
import { getFullName } from "@/features/user/utils";
import { createEventLog } from "@/features/eventLog/data";
import { sendEmailRecoverPassword } from "@/lib/services/resend/recoverPassword/recoverPassword";
import { NextResponse } from "next/server";
import { POST } from "@/app/api/auth/changePassword/route";

jest.mock("@/features/user/data");
jest.mock("@/lib/services/language/getServerLanguage");
jest.mock("@/lib/auth/generatePassword");
jest.mock("@/features/user/utils");
jest.mock("@/features/eventLog/data");
jest.mock("@/lib/services/resend/recoverPassword/recoverPassword");
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}));

describe("POST /api/user/recoverPassword", () => {
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
    (generateRandomPassword as jest.Mock).mockReturnValue("RandomPassword123");
    (getFullName as jest.Mock).mockImplementation((first, second, name) => `${name} ${first} ${second}`);
  });

  describe("Positive cases", () => {
    it("recovers password successfully", async () => {
      const request = {
        json: jest.fn().mockResolvedValue({ email: "test@example.com" }),
      } as unknown as Request;

      (sendEmailRecoverPassword as jest.Mock).mockResolvedValue(true);
      (userRecoverPassword as jest.Mock).mockResolvedValue({ success: true, data: "user123" });
      (getUserNameById as jest.Mock).mockResolvedValue({ success: true, data: { name: "Test", firstSurname: "One", secondSurname: "Two" } });
      (createEventLog as jest.Mock).mockResolvedValue({ success: true });

      const res = await POST(request);

      expect(sendEmailRecoverPassword).toHaveBeenCalledWith("test@example.com", "RandomPassword123");
      expect(userRecoverPassword).toHaveBeenCalledWith("test@example.com", "RandomPassword123");
      expect(getUserNameById).toHaveBeenCalledWith("user123");
      expect(createEventLog).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: true, data: null, error: null },
        { status: 201 }
      );
      expect(res.status).toBe(201);
    });
  });

  describe("Negative cases", () => {
    it("returns 400 if email is missing", async () => {
      const request = { json: jest.fn().mockResolvedValue({}) } as unknown as Request;

      const res = await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: false, data: null, error: "Auth.Route.invalidValues" },
        { status: 400 }
      );
      expect(res.status).toBe(400);
    });

    it("returns 500 if email sending fails", async () => {
      const request = { json: jest.fn().mockResolvedValue({ email: "test@example.com" }) } as unknown as Request;
      (sendEmailRecoverPassword as jest.Mock).mockResolvedValue(false);

      const res = await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: false, data: null, error: "Auth.Route.emailSendError" },
        { status: 500 }
      );
      expect(res.status).toBe(500);
    });

    it("returns 500 if userRecoverPassword fails", async () => {
      const request = { json: jest.fn().mockResolvedValue({ email: "test@example.com" }) } as unknown as Request;
      (sendEmailRecoverPassword as jest.Mock).mockResolvedValue(true);
      (userRecoverPassword as jest.Mock).mockResolvedValue({ success: false, data: null, error: "Some error" });

      const res = await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: false, data: null, error: "Some error" },
        { status: 500 }
      );
      expect(res.status).toBe(500);
    });

    it("returns 404 if getUserNameById fails", async () => {
      const request = { json: jest.fn().mockResolvedValue({ email: "test@example.com" }) } as unknown as Request;
      (sendEmailRecoverPassword as jest.Mock).mockResolvedValue(true);
      (userRecoverPassword as jest.Mock).mockResolvedValue({ success: true, data: "user123" });
      (getUserNameById as jest.Mock).mockResolvedValue({ success: false, data: null, error: "Not found" });

      const res = await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { data: null, success: false, error: "User.Route.userNotFound" },
        { status: 404 }
      );
      expect(res.status).toBe(404);
    });

    it("returns 500 if createEventLog fails", async () => {
      const request = { json: jest.fn().mockResolvedValue({ email: "test@example.com" }) } as unknown as Request;
      (sendEmailRecoverPassword as jest.Mock).mockResolvedValue(true);
      (userRecoverPassword as jest.Mock).mockResolvedValue({ success: true, data: "user123" });
      (getUserNameById as jest.Mock).mockResolvedValue({ success: true, data: { name: "Test", firstSurname: "One", secondSurname: "Two" } });
      (createEventLog as jest.Mock).mockResolvedValue({ error: "Log failed" });

      const res = await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { success: false, data: null, error: "User.Route.createEventLogError" },
        { status: 500 }
      );
      expect(res.status).toBe(500);
    });
  });

  describe("Error handling", () => {
    it("returns 500 on unexpected error", async () => {
      const request = { json: jest.fn().mockRejectedValue(new Error("Unexpected")) } as unknown as Request;

      const res = await POST(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { data: null, success: false, error: "Internal Server Error" },
        { status: 500 }
      );
      expect(res.status).toBe(500);
    });
  });
});
