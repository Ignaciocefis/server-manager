import { PUT } from "@/app/api/user/update/password/route";
import { getUserByIdWithPassword, updatePassword } from "@/features/user/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import bcrypt, { compare } from "bcryptjs";
import { NextResponse } from "next/server";

jest.mock("@/features/user/data");
jest.mock("@/lib/auth/hasCategory");
jest.mock("@/lib/services/language/getServerLanguage");
jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}));

describe("PUT /api/user/update/password", () => {
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.resetAllMocks();
    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
  });

  it("returns 401 if user is not authenticated", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: null });

    const req = {
      json: async () => ({ currentPassword: "123", newPassword: "abc123" }),
      method: "PUT",
      url: "http://localhost/api/user/update/password",
    } as unknown as Request;

    await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("User.Route.unauthorized") },
      { status: 401 }
    );
  });

  it("returns 404 if validation fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user123" });

    const req = {
      json: async () => ({ currentPassword: "123", newPassword: "abc123" }),
      method: "PUT",
      url: "http://localhost/api/user/update/password",
    } as unknown as Request;

    await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("User.Route.invalidValues") },
      { status: 404 }
    );

  });

  it("returns 404 if user not found", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user123" });
    (getUserByIdWithPassword as jest.Mock).mockResolvedValue({ success: true, data: null });

    const req = {
      json: async () => ({ currentPassword: "123", newPassword: "abc123" }),
      method: "PUT",
      url: "http://localhost/api/user/update/password",
    } as unknown as Request;

    await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("User.Route.userNotFound") },
      { status: 404 }
    );

  });

  it("returns 401 if current password is incorrect", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user123" });
    (getUserByIdWithPassword as jest.Mock).mockResolvedValue({ success: true, data: { password: "hashed" } });
    (compare as jest.Mock).mockResolvedValue(false);

    const req = {
      json: async () => ({ currentPassword: "123", newPassword: "abc123" }),
      method: "PUT",
      url: "http://localhost/api/user/update/password",
    } as unknown as Request;

    await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("User.Route.currentPasswordIncorrect") },
      { status: 401 }
    );
  });

  it("returns 500 if updatePassword fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user123" });
    (getUserByIdWithPassword as jest.Mock).mockResolvedValue({ success: true, data: { password: "hashed" } });
    (compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue("newHashed");
    (updatePassword as jest.Mock).mockResolvedValue({ success: false });

    const req = {
      json: async () => ({ currentPassword: "123", newPassword: "abc123" }),
      method: "PUT",
      url: "http://localhost/api/user/update/password",
    } as unknown as Request;

    await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("User.Route.updatePasswordError") },
      { status: 500 }
    );
  });

  it("returns 200 if password updated successfully", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user123" });
    (getUserByIdWithPassword as jest.Mock).mockResolvedValue({ success: true, data: { password: "hashed" } });
    (compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue("newHashed");
    (updatePassword as jest.Mock).mockResolvedValue({ success: true });

    const req = {
      json: async () => ({ currentPassword: "123", newPassword: "abc123" }),
      method: "PUT",
      url: "http://localhost/api/user/update/password",
    } as unknown as Request;

    await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: true, data: null, error: null },
      { status: 200 }
    );
  });

  it("returns 500 on unexpected error", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user123" });
    (getUserByIdWithPassword as jest.Mock).mockRejectedValue(new Error("Unexpected"));

    const req = {
      json: async () => ({ currentPassword: "123", newPassword: "abc123" }),
      method: "PUT",
      url: "http://localhost/api/user/update/password",
    } as unknown as Request;

    await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  });
});
