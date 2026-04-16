jest.mock("@/features/server/data");
jest.mock("@/features/eventLog/data");
jest.mock("@/lib/auth/hasCategory");
jest.mock("@/lib/services/language/getServerLanguage");
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}));
jest.mock("@/features/server/shemas", () => ({
  updateServerFormSchema: jest.fn(() => ({
    parse: jest.fn((body) => body),
  })),
}));

import { PUT } from "@/app/api/server/update/route";
import { getServerById, existsServerByName, updateServerWithGpus } from "@/features/server/data";
import { createEventLog } from "@/features/eventLog/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { updateServerFormSchema } from "@/features/server/shemas";
import { NextResponse } from "next/server";

describe("PUT /api/server/update", () => {
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    (NextResponse.json as jest.Mock).mockImplementation((data: unknown, init?: { status?: number } | undefined) => ({ data, status: init?.status }));
    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
    (updateServerFormSchema as jest.Mock).mockReturnValue({
      parse: jest.fn((body) => body),
    });
  });

  it("returns 403 if user is not admin", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: false });

    const req = { json: jest.fn().mockResolvedValue({}) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.accessDenied") },
      { status: 403 }
    );
    expect(res.status).toBe(403);
  });

  it("returns 400 if serverId is missing or invalid", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });

    const req = { json: jest.fn().mockResolvedValue({ serverId: 123 }) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.invalidServerId") },
      { status: 400 }
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 if server does not exist", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (getServerById as jest.Mock).mockResolvedValue(null);

    const req = { json: jest.fn().mockResolvedValue({ serverId: "srv1", name: "NewServer" }) } as unknown as Request;
    const res = await PUT(req);

    expect(getServerById).toHaveBeenCalledWith("srv1");
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.serverNotFound") },
      { status: 404 }
    );
    expect(res.status).toBe(404);
  });

  it("returns 409 if server name already exists", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (getServerById as jest.Mock).mockResolvedValue({ data: { name: "OldServer" } });
    (existsServerByName as jest.Mock).mockResolvedValue({ data: true });

    const req = { json: jest.fn().mockResolvedValue({ serverId: "srv1", name: "NewServer" }) } as unknown as Request;
    const res = await PUT(req);

    expect(existsServerByName).toHaveBeenCalledWith("NewServer");
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.serverNameExists") },
      { status: 409 }
    );
    expect(res.status).toBe(409);
  });

  it("returns 500 if updateServerWithGpus fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (getServerById as jest.Mock).mockResolvedValue({ data: { name: "OldServer" } });
    (existsServerByName as jest.Mock).mockResolvedValue({ data: false });
    (updateServerWithGpus as jest.Mock).mockResolvedValue({ success: false });

    const req = { json: jest.fn().mockResolvedValue({ serverId: "srv1", name: "UpdatedServer" }) } as unknown as Request;
    const res = await PUT(req);

    expect(updateServerWithGpus).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.updateServerError") },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 500 if event log creation fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (getServerById as jest.Mock).mockResolvedValue({ data: { name: "OldServer" } });
    (existsServerByName as jest.Mock).mockResolvedValue({ data: false });
    (updateServerWithGpus as jest.Mock).mockResolvedValue({ success: true, data: { name: "UpdatedServer" } });
    (createEventLog as jest.Mock).mockResolvedValue({ error: true });

    const req = { json: jest.fn().mockResolvedValue({ serverId: "srv1", name: "UpdatedServer" }) } as unknown as Request;
    const res = await PUT(req);

    expect(createEventLog).toHaveBeenCalledWith({
      eventType: "SERVER_UPDATED",
      message: "EventLog.logMessage.server_updated|UpdatedServer",
      serverId: "srv1",
    });
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.eventLogError") },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 200 on successful update and log creation", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
    (getServerById as jest.Mock).mockResolvedValue({ data: { name: "OldServer" } });
    (existsServerByName as jest.Mock).mockResolvedValue({ data: false });
    (updateServerWithGpus as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: "srv1", name: "UpdatedServer" },
    });
    (createEventLog as jest.Mock).mockResolvedValue({ success: true });

    const req = { json: jest.fn().mockResolvedValue({ serverId: "srv1", name: "UpdatedServer" }) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        success: true,
        data: { id: "srv1", name: "UpdatedServer" },
        error: null,
      },
      { status: 200 }
    );
    expect(res.status).toBe(200);
  });

  it("returns 500 on unexpected error (catch)", async () => {
    (getServerLanguage as jest.Mock).mockRejectedValue(new Error("Unexpected"));

    const req = { json: jest.fn() } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });
});
