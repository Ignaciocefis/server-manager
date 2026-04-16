import { PUT } from "@/app/api/user/update/profile/route";
import { updateUser } from "@/features/user/data";
import { createEventLog } from "@/features/eventLog/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { getFullName } from "@/features/user/utils";
import { NextResponse } from "next/server";

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

describe("PUT /api/user/update/profile", () => {
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
    (getFullName as jest.Mock).mockImplementation((first, second, name) => `${first ?? ""} ${second ?? ""} ${name ?? ""}`.trim());
  });

  it("returns 401 if user is not authenticated", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: null });

    const req = { json: jest.fn().mockResolvedValue({ userId: "junior1", researcherId: "researcher1" }) } as unknown as Request;

    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("User.Route.unauthorized") },
      { status: 401 }
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 if validation fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user123" });

    const req = { json: jest.fn().mockResolvedValue({ invalidField: "value" }) } as unknown as Request;


    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("User.Route.invalidValues") },
      { status: 400 }
    );
    expect(res.status).toBe(400);
  });

  it("returns 500 if updateUser fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user123" });
    (updateUser as jest.Mock).mockResolvedValue({ success: false });

    const req = { json: jest.fn().mockResolvedValue({ firstSurname: "Test", name: "User" }) } as unknown as Request;

    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("User.Route.updateProfileError") },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 500 if createEventLog fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user123" });
    (updateUser as jest.Mock).mockResolvedValue({ success: true, data: { id: "user123" } });
    (createEventLog as jest.Mock).mockResolvedValue({ error: true });

    const req = { json: jest.fn().mockResolvedValue({ userId: "junior1", researcherId: "researcher1" }) } as unknown as Request;

    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("User.Route.invalidValues") },
      { status: 400 }
    );
    expect(res.status).toBe(400);
  });

  it("returns 200 if profile updated successfully", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user123" });
    (updateUser as jest.Mock).mockResolvedValue({ success: true, data: { id: "user123" } });
    (createEventLog as jest.Mock).mockResolvedValue({ success: true });

    const req = { json: jest.fn().mockResolvedValue({ userId: "junior1", researcherId: "researcher1" }) } as unknown as Request;

    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: "User.Route.invalidValues" },
      { status: 400 }
    );
    expect(res.status).toBe(400);
  });

  it("returns 500 on unexpected error", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user123" });
    (updateUser as jest.Mock).mockRejectedValue(new Error("Unexpected"));

    const req = { json: jest.fn().mockResolvedValue({ userId: "junior1", researcherId: "researcher1" }) } as unknown as Request;

    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: "User.Route.invalidValues" },
      { status: 400 }
    );
    expect(res.status).toBe(400);
  });
});
