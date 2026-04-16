jest.mock("@/features/server/data");
jest.mock("@/features/user/data");
jest.mock("@/features/eventLog/data");
jest.mock("@/lib/services/language/getServerLanguage");
jest.mock("@/features/user/utils");
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}));
jest.mock("@/lib/auth/hasCategory");

import { PUT } from "@/app/api/server/assignServers/route";
import { assignServersToUser, getServersNameById } from "@/features/server/data";
import { getUserNameById } from "@/features/user/data";
import { createEventLog } from "@/features/eventLog/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { getFullName } from "@/features/user/utils";
import { NextResponse } from "next/server";

describe("PUT /api/server/assignServers", () => {
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    (NextResponse.json as jest.Mock).mockClear();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (NextResponse.json as jest.Mock).mockImplementation((data: any, init?: any) => ({ data, status: init?.status }));
    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
    (getFullName as jest.Mock).mockImplementation((first, second, name) => `${first ?? ""} ${second ?? ""} ${name ?? ""}`.trim());
  });

  it("returns 401 if user not authorized", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ requesterId: null, isCategory: false });

    const req = { json: jest.fn().mockResolvedValue({ userId: "user1", serverIds: ["srv1"] }) } as unknown as Request;

    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.unauthorized") },
      { status: 401 }
    );
    expect(res.status).toEqual(401);
  });

  it("returns 400 if request body is invalid", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "admin", isCategory: true });

    const req = { json: jest.fn().mockResolvedValue({ userId: "user1", serverIds: [123] }) } as unknown as Request;

    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.invalidFields") },
      { status: 400 }
    );
    expect(res.status).toEqual(400);
  });

  it("returns 500 if assignServersToUser fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "admin", isCategory: true });
    (assignServersToUser as jest.Mock).mockResolvedValue({ success: false });

    const req = { json: jest.fn().mockResolvedValue({ userId: "user1", serverIds: ["srv1"] }) } as unknown as Request;

    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.assignError") },
      { status: 500 }
    );
    expect(res.status).toEqual(500);
  });

  it("returns 404 if user not found", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "admin", isCategory: true });
    (assignServersToUser as jest.Mock).mockResolvedValue({ success: true, data: { removed: [] } });
    (getUserNameById as jest.Mock).mockResolvedValue({ success: false });

    const req = { json: jest.fn().mockResolvedValue({ userId: "user1", serverIds: ["srv1"] }) } as unknown as Request;

    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: mockT("User.Route.userNotFound") },
      { status: 404 }
    );
    expect(res.status).toEqual(404);
  });

  it("returns 404 if servers not found", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "admin", isCategory: true });
    (assignServersToUser as jest.Mock).mockResolvedValue({ success: true, data: { removed: [] } });
    (getUserNameById as jest.Mock).mockResolvedValue({ success: true, data: { name: "Test", firstSurname: "User", secondSurname: "Demo" } });
    (getServersNameById as jest.Mock).mockResolvedValue({ success: false });

    const req = { json: jest.fn().mockResolvedValue({ userId: "user1", serverIds: ["srv1"] }) } as unknown as Request;

    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: mockT("Server.Route.serversNotFound") },
      { status: 404 }
    );
    expect(res.status).toEqual(404);
  });

  it("returns 500 if log creation fails for granted servers", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "admin", isCategory: true });
    (assignServersToUser as jest.Mock).mockResolvedValue({ success: true, data: { removed: [] } });
    (getUserNameById as jest.Mock).mockResolvedValue({ success: true, data: { name: "Test", firstSurname: "User", secondSurname: "Demo" } });
    (getServersNameById as jest.Mock).mockResolvedValue({ success: true, data: [{ id: "srv1", name: "Server1" }] });
    (createEventLog as jest.Mock).mockResolvedValue({ error: true });

    const req = { json: jest.fn().mockResolvedValue({ userId: "user1", serverIds: ["srv1"] }) } as unknown as Request;

    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.eventLogError") },
      { status: 500 }
    );
    expect(res.status).toEqual(500);
  });

  it("returns 200 on successful assignment and log creation", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "admin", isCategory: true });
    (assignServersToUser as jest.Mock).mockResolvedValue({ success: true, data: { removed: [{ id: "srv2" }] } });
    (getUserNameById as jest.Mock).mockResolvedValue({ success: true, data: { name: "Test", firstSurname: "User", secondSurname: "Demo" } });
    (getServersNameById as jest.Mock).mockResolvedValue({ success: true, data: [{ id: "srv1", name: "Server1" }, { id: "srv2", name: "Server2" }] });
    (createEventLog as jest.Mock).mockResolvedValue({ success: true });

    const req = { json: jest.fn().mockResolvedValue({ userId: "user1", serverIds: ["srv1"] }) } as unknown as Request;

    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: true, data: null, error: null },
      { status: 200 }
    );
    expect(res.status).toEqual(200);
  });

  it("returns 500 on unexpected error", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "admin", isCategory: true });
    (assignServersToUser as jest.Mock).mockRejectedValue(new Error("Unexpected"));

    const req = { json: jest.fn().mockResolvedValue({ userId: "user1", serverIds: ["srv1"] }) } as unknown as Request;

    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
    expect(res.status).toEqual(500);
  });
});
