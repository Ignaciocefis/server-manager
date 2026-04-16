jest.mock("@/features/server/data");
jest.mock("@/features/eventLog/data");
jest.mock("@/lib/services/language/getServerLanguage");
jest.mock("@/lib/auth/hasCategory");
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}));

import { DELETE } from "@/app/api/server/delete/route";
import { hasCategory } from "@/lib/auth/hasCategory";
import { existsServerById, getServersNameById, deleteServer } from "@/features/server/data";
import { createEventLog } from "@/features/eventLog/data";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

describe("DELETE /api/server/delete", () => {
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    (NextResponse.json as jest.Mock).mockImplementation((data: unknown, init?: { status?: number } | undefined) => ({ data, status: init?.status }));
    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
  });

  it("returns 403 if user is not admin", async () => {
    (hasCategory as jest.Mock).mockResolvedValue(false);

    const req = { json: jest.fn().mockResolvedValue({ serverId: "srv1" }) } as unknown as Request;
    const res = await DELETE(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.unauthorized") },
      { status: 403 }
    );
    expect(res.status).toBe(403);
  });

  it("returns 400 if serverId is invalid", async () => {
    (hasCategory as jest.Mock).mockResolvedValue(true);

    const req = { json: jest.fn().mockResolvedValue({ serverId: 123 }) } as unknown as Request;
    const res = await DELETE(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.serverIdRequired") },
      { status: 400 }
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 if server does not exist", async () => {
    (hasCategory as jest.Mock).mockResolvedValue(true);
    (existsServerById as jest.Mock).mockResolvedValue(false);

    const req = { json: jest.fn().mockResolvedValue({ serverId: "srv1" }) } as unknown as Request;
    const res = await DELETE(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.serverNotFound") },
      { status: 404 }
    );
    expect(res.status).toBe(404);
  });

  it("returns 500 if getServersNameById fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue(true);
    (existsServerById as jest.Mock).mockResolvedValue(true);
    (getServersNameById as jest.Mock).mockResolvedValue({ success: false });

    const req = { json: jest.fn().mockResolvedValue({ serverId: "srv1" }) } as unknown as Request;
    const res = await DELETE(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.getServerNameError") },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 500 if createEventLog fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue(true);
    (existsServerById as jest.Mock).mockResolvedValue(true);
    (getServersNameById as jest.Mock).mockResolvedValue({
      success: true,
      data: [{ id: "srv1", name: "Server1" }],
    });
    (createEventLog as jest.Mock).mockResolvedValue({ error: true });

    const req = { json: jest.fn().mockResolvedValue({ serverId: "srv1" }) } as unknown as Request;
    const res = await DELETE(req);

    expect(createEventLog).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "SERVER_DELETED",
        message: expect.stringContaining("server_deleted|Server1"),
        serverId: "srv1",
      })
    );

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.eventLogError") },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 500 if deleteServer fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue(true);
    (existsServerById as jest.Mock).mockResolvedValue(true);
    (getServersNameById as jest.Mock).mockResolvedValue({
      success: true,
      data: [{ id: "srv1", name: "Server1" }],
    });
    (createEventLog as jest.Mock).mockResolvedValue({ success: true });
    (deleteServer as jest.Mock).mockResolvedValue({ success: false });

    const req = { json: jest.fn().mockResolvedValue({ serverId: "srv1" }) } as unknown as Request;
    const res = await DELETE(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.deleteServerError") },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 200 on successful deletion", async () => {
    (hasCategory as jest.Mock).mockResolvedValue(true);
    (existsServerById as jest.Mock).mockResolvedValue(true);
    (getServersNameById as jest.Mock).mockResolvedValue({
      success: true,
      data: [{ id: "srv1", name: "Server1" }],
    });
    (createEventLog as jest.Mock).mockResolvedValue({ success: true });
    (deleteServer as jest.Mock).mockResolvedValue({ success: true, data: { id: "srv1" } });

    const req = { json: jest.fn().mockResolvedValue({ serverId: "srv1" }) } as unknown as Request;
    const res = await DELETE(req);

    expect(deleteServer).toHaveBeenCalledWith("srv1");
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: true, data: { id: "srv1" }, error: null },
      { status: 200 }
    );
    expect(res.status).toBe(200);
  });

  it("returns 500 on unexpected error", async () => {
    (getServerLanguage as jest.Mock).mockRejectedValue(new Error("Unexpected"));

    const req = { json: jest.fn().mockResolvedValue({ serverId: "srv1" }) } as unknown as Request;
    const res = await DELETE(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });
});
