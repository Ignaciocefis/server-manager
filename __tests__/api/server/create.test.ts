jest.mock("@/features/server/data");
jest.mock("@/features/eventLog/data");
jest.mock("@/lib/services/language/getServerLanguage");
jest.mock("@/lib/auth/hasCategory");
jest.mock("@/features/server/shemas", () => ({
  createServerFormSchema: jest.fn(),
}));
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data: unknown, init?: { status?: number }) => ({ data, status: init?.status })),
  },
}));

import { POST } from "@/app/api/server/create/route";
import { hasCategory } from "@/lib/auth/hasCategory";
import { existsServerByName, createServer } from "@/features/server/data";
import { createEventLog } from "@/features/eventLog/data";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { createServerFormSchema } from "@/features/server/shemas";
import { NextResponse } from "next/server";

describe("POST /api/server/create", () => {
  const mockT = jest.fn((key: string) => key);
  const mockParse = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (NextResponse.json as jest.Mock).mockImplementation((data: unknown, init?: { status?: number } | undefined) => ({ data, status: init?.status }));
    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
    (createServerFormSchema as jest.Mock).mockReturnValue({ parse: mockParse });
  });

  it("returns 403 if user is not admin", async () => {
    (hasCategory as jest.Mock).mockResolvedValue(false);
    mockParse.mockReturnValue({ name: "ServerTest" });

    const req = { json: jest.fn().mockResolvedValue({ name: "ServerTest" }) } as unknown as Request;
    const res = await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.unauthorized") },
      { status: 403 }
    );
    expect(res.status).toBe(403);
  });

  it("returns 409 if server already exists", async () => {
    (hasCategory as jest.Mock).mockResolvedValue(true);
    (existsServerByName as jest.Mock).mockResolvedValue({ success: true, data: true });
    mockParse.mockReturnValue({ name: "ServerTest" });

    const req = { json: jest.fn().mockResolvedValue({ name: "ServerTest" }) } as unknown as Request;
    const res = await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.serverExists") },
      { status: 409 }
    );
    expect(res.status).toBe(409);
  });

  it("returns 500 if createServer fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue(true);
    (existsServerByName as jest.Mock).mockResolvedValue({ success: false, data: null });
    (createServer as jest.Mock).mockResolvedValue({ success: false });
    mockParse.mockReturnValue({ name: "ServerTest" });

    const req = { json: jest.fn().mockResolvedValue({ name: "ServerTest" }) } as unknown as Request;
    const res = await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.createServerError") },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 500 if event log creation fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue(true);
    (existsServerByName as jest.Mock).mockResolvedValue({ success: false, data: null });
    (createServer as jest.Mock).mockResolvedValue({ success: true, data: "srv123" });
    (createEventLog as jest.Mock).mockResolvedValue({ error: true });
    mockParse.mockReturnValue({ name: "ServerTest" });

    const req = { json: jest.fn().mockResolvedValue({ name: "ServerTest" }) } as unknown as Request;
    const res = await POST(req);

    expect(createEventLog).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "SERVER_CREATED",
        message: expect.stringContaining("server_created"),
        serverId: "srv123",
      })
    );

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Server.Route.eventLogError") },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 201 on successful creation and log", async () => {
    (hasCategory as jest.Mock).mockResolvedValue(true);
    (existsServerByName as jest.Mock).mockResolvedValue({ success: false, data: null });
    (createServer as jest.Mock).mockResolvedValue({ success: true, data: "srv123" });
    (createEventLog as jest.Mock).mockResolvedValue({ success: true });
    mockParse.mockReturnValue({ name: "ServerTest" });

    const req = { json: jest.fn().mockResolvedValue({ name: "ServerTest" }) } as unknown as Request;
    const res = await POST(req);

    expect(createEventLog).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "SERVER_CREATED",
        message: "EventLog.logMessage.server_created|ServerTest",
        serverId: "srv123",
      })
    );

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: true, data: { serverId: "srv123" }, error: null },
      { status: 201 }
    );
    expect(res.status).toBe(201);
  });

  it("returns 500 on unexpected error (catch)", async () => {
    (getServerLanguage as jest.Mock).mockRejectedValue(new Error("Unexpected"));

    const req = { json: jest.fn().mockResolvedValue({ name: "ServerTest" }) } as unknown as Request;
    const res = await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("throws 400 if schema validation fails", async () => {
    const validationError = new Error("Invalid schema");
    (hasCategory as jest.Mock).mockResolvedValue(true);
    mockParse.mockImplementation(() => {
      throw validationError;
    });

    const req = { json: jest.fn().mockResolvedValue({}) } as unknown as Request;
    const res = await POST(req);

    expect(res.status).toBe(500);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  });
});
