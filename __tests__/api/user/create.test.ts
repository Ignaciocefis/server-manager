import { POST } from "@/app/api/user/create/route";
import { hasCategory } from "@/lib/auth/hasCategory";
import { generateRandomPassword } from "@/lib/auth/generatePassword";
import { createUser, existsUserByEmail, getUserNameById } from "@/features/user/data";
import { createUserSchema } from "@/features/user/schemas";
import { createEventLog } from "@/features/eventLog/data";
import { getFullName } from "@/features/user/utils";
import { sendEmailCreateUser } from "@/lib/services/resend/CreateUser/createUser";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

jest.mock("@/lib/auth/hasCategory");
jest.mock("@/lib/auth/generatePassword");
jest.mock("@/features/user/data");
jest.mock("@/features/user/utils");
jest.mock("@/features/user/schemas");
jest.mock("@/features/eventLog/data");
jest.mock("@/lib/services/resend/CreateUser/createUser");
jest.mock("@/lib/services/language/getServerLanguage");
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}));

describe("POST /api/user/create - exhaustive tests", () => {
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
    (createUserSchema as jest.Mock).mockReturnValue({
      safeParse: (body: unknown) => ({ success: true, data: body }),
    });
    (generateRandomPassword as jest.Mock).mockReturnValue("password123");
  });

  it("returns 403 if user is not ADMIN", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: false });
    const req = { json: jest.fn() } as unknown as Request;

    const res = await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("User.Route.unauthorized") },
      { status: 403 }
    );
    expect(res.status).toBe(403);
  });

  it("returns 400 if validation fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    const req = { json: jest.fn().mockResolvedValue({}) } as unknown as Request;

    (createUserSchema as jest.Mock).mockReturnValue({
      safeParse: () => ({ success: false }),
    });

    const res = await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("User.Route.invalidValues") },
      { status: 400 }
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 if user already exists", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (existsUserByEmail as jest.Mock).mockResolvedValue({ data: true });
    const req = { json: jest.fn().mockResolvedValue({ email: "test@example.com", name: "Test" }) } as unknown as Request;

    const res = await POST(req);

    expect(existsUserByEmail).toHaveBeenCalledWith("test@example.com");
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("User.Route.userExists") },
      { status: 400 }
    );
    expect(res.status).toBe(400);
  });

  it("returns 500 if sending email fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (existsUserByEmail as jest.Mock).mockResolvedValue({ data: false });
    (sendEmailCreateUser as jest.Mock).mockResolvedValue(false);
    const req = { json: jest.fn().mockResolvedValue({ email: "test@example.com", name: "Test" }) } as unknown as Request;

    const res = await POST(req);

    expect(sendEmailCreateUser).toHaveBeenCalledWith("test@example.com", "password123");
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("User.Route.emailSendError") },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 500 if createUser fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (existsUserByEmail as jest.Mock).mockResolvedValue({ data: false });
    (sendEmailCreateUser as jest.Mock).mockResolvedValue(true);
    (createUser as jest.Mock).mockResolvedValue({ success: false, error: "error" });
    const req = { json: jest.fn().mockResolvedValue({ email: "test@example.com", name: "Test" }) } as unknown as Request;

    const res = await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: "error" },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 404 if getUserNameById fails or has no data", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (existsUserByEmail as jest.Mock).mockResolvedValue({ data: false });
    (sendEmailCreateUser as jest.Mock).mockResolvedValue(true);
    (createUser as jest.Mock).mockResolvedValue({ success: true, data: "user123" });
    (getUserNameById as jest.Mock).mockResolvedValue({ success: false, data: null, error: "not found" });

    const req = { json: jest.fn().mockResolvedValue({ email: "test@example.com", name: "Test" }) } as unknown as Request;

    const res = await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: mockT("User.Route.userNotFound") },
      { status: 404 }
    );
    expect(res.status).toBe(404);
  });

  it("returns 500 if createEventLog fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (existsUserByEmail as jest.Mock).mockResolvedValue({ data: false });
    (sendEmailCreateUser as jest.Mock).mockResolvedValue(true);
    (createUser as jest.Mock).mockResolvedValue({ success: true, data: "user123" });
    (getUserNameById as jest.Mock).mockResolvedValue({
      success: true,
      data: { firstSurname: "A", secondSurname: "B", name: "Test" },
    });
    (getFullName as jest.Mock).mockReturnValue("Test A B");
    (createEventLog as jest.Mock).mockResolvedValue({ error: "log error" });

    const req = { json: jest.fn().mockResolvedValue({ email: "test@example.com", name: "Test" }) } as unknown as Request;

    const res = await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("User.Route.createEventLogError") },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("creates user successfully (happy path)", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (existsUserByEmail as jest.Mock).mockResolvedValue({ data: false });
    (sendEmailCreateUser as jest.Mock).mockResolvedValue(true);
    (createUser as jest.Mock).mockResolvedValue({ success: true, data: "user123" });
    (getUserNameById as jest.Mock).mockResolvedValue({
      success: true,
      data: { firstSurname: "A", secondSurname: "B", name: "Test" },
    });
    (getFullName as jest.Mock).mockReturnValue("Test A B");
    (createEventLog as jest.Mock).mockResolvedValue({ success: true });

    const req = { json: jest.fn().mockResolvedValue({ email: "test@example.com", name: "Test" }) } as unknown as Request;

    const res = await POST(req);

    expect(res.status).toBe(201);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: true, data: null, error: null },
      { status: 201 }
    );
  });
});
