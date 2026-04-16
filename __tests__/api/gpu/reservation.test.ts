jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}));
jest.mock("@/features/gpu/data");
jest.mock("@/features/server/data");
jest.mock("@/features/eventLog/data");
jest.mock("@/lib/auth/hasCategory");
jest.mock("@/lib/services/language/getServerLanguage");

import { POST } from "@/app/api/gpu/reservation/route";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { existGpusByIdsAndServer, getOverlappingReservations, createGpuReservations, getGpuNameById } from "@/features/gpu/data";
import { hasAccessToServer, getServersNameById } from "@/features/server/data";
import { createEventLog } from "@/features/eventLog/data";
import { NextResponse } from "next/server";
import { z } from "zod";

describe("POST /api/gpu/reservation", () => {
  const mockT = jest.fn((key: string) => key);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const from = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0);
  const to = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 12, 0);

  const baseData = {
    serverId: "srv1",
    selectedGpuIds: ["gpu1"],
    range: { from, to },
    startHour: "10:00",
    endHour: "12:00",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
    (NextResponse.json as jest.Mock).mockImplementation((data: unknown, init?: { status?: number } | undefined) => ({ data, status: init?.status }));
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1", isCategory: true });
    (existGpusByIdsAndServer as jest.Mock).mockResolvedValue({ success: true, data: true });
    (getOverlappingReservations as jest.Mock).mockResolvedValue({ success: true, data: false });
    (createGpuReservations as jest.Mock).mockResolvedValue({ success: true, data: [{ id: "res1", gpuId: "gpu1", serverId: "srv1" }] });
    (getGpuNameById as jest.Mock).mockResolvedValue({ success: true, data: { name: "GPU1" } });
    (getServersNameById as jest.Mock).mockResolvedValue({ success: true, data: [{ name: "Server1" }] });
    (createEventLog as jest.Mock).mockResolvedValue({ success: true });
    (hasAccessToServer as jest.Mock).mockResolvedValue(true);
  });

  it("returns 401 if user not authorized", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: null });

    const req = { json: jest.fn().mockResolvedValue(baseData) } as unknown as Request;
    const res = await POST(req);

    expect(res.status).toBe(401);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.unauthorized") },
      { status: 401 }
    );
  });

  it("returns 400 if startHour >= endHour", async () => {
    const req = { json: jest.fn().mockResolvedValue({ ...baseData, startHour: "12:00", endHour: "10:00" }) } as unknown as Request;
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.theStartHourMustBeBeforeEndHour") },
      { status: 400 }
    );
  });

  it("returns 400 if reservation is in the past", async () => {
    const past = new Date();
    past.setHours(past.getHours() - 2);
    const req = {
      json: jest.fn().mockResolvedValue({
        ...baseData,
        range: { from: past, to: past },
      }),
    } as unknown as Request;

    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.noReservationsInThePast") },
      { status: 400 }
    );
  });

  it("returns 403 if user has no access to server", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1", isCategory: false });
    (hasAccessToServer as jest.Mock).mockResolvedValue(false);

    const req = { json: jest.fn().mockResolvedValue(baseData) } as unknown as Request;
    const res = await POST(req);

    expect(res.status).toBe(403);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.noAccessToServer") },
      { status: 403 }
    );
  });

  it("returns 400 if GPUs do not exist or do not belong to server", async () => {
    (existGpusByIdsAndServer as jest.Mock).mockResolvedValue({ success: true, data: false });

    const req = { json: jest.fn().mockResolvedValue(baseData) } as unknown as Request;
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.gpuNotFoundOrNotBelong") },
      { status: 400 }
    );
  });

  it("returns 409 if GPUs are already reserved", async () => {
    (getOverlappingReservations as jest.Mock).mockResolvedValue({ success: true, data: true });

    const req = { json: jest.fn().mockResolvedValue(baseData) } as unknown as Request;
    const res = await POST(req);

    expect(res.status).toBe(409);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.gpuAlreadyReserved") },
      { status: 409 }
    );
  });

  it("returns 500 if createGpuReservations throws", async () => {
    (createGpuReservations as jest.Mock).mockRejectedValue(new Error("Boom"));

    const req = { json: jest.fn().mockResolvedValue(baseData) } as unknown as Request;
    const res = await POST(req);

    expect(res.status).toBe(500);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: "Internal Server Error" },
      { status: 500 }
    );
  });

  it("returns 404 if getGpuNameById fails", async () => {
    (getGpuNameById as jest.Mock).mockResolvedValue({ success: false });

    const req = { json: jest.fn().mockResolvedValue(baseData) } as unknown as Request;
    const res = await POST(req);

    expect(res.status).toBe(404);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.gpuNotFound") },
      { status: 404 }
    );
  });

  it("returns 404 if getServersNameById fails", async () => {
    (getServersNameById as jest.Mock).mockResolvedValue({ success: false });

    const req = { json: jest.fn().mockResolvedValue(baseData) } as unknown as Request;
    const res = await POST(req);

    expect(res.status).toBe(404);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.serverNotFound") },
      { status: 404 }
    );
  });

  it("returns 500 if createEventLog fails", async () => {
    (createEventLog as jest.Mock).mockResolvedValue({ success: false, error: "log error" });

    const req = { json: jest.fn().mockResolvedValue(baseData) } as unknown as Request;
    const res = await POST(req);

    expect(res.status).toBe(500);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.eventLogError") },
      { status: 500 }
    );
  });

  it("returns 400 if body fails Zod validation", async () => {
    const req = { json: jest.fn().mockResolvedValue({ invalid: "data" }) } as unknown as Request;
    const res = await POST(req);

    expect(res.status).toBe(400);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: expect.any(z.ZodError) },
      { status: 400 }
    );
  });

  it("returns 201 on successful reservation", async () => {
    const req = { json: jest.fn().mockResolvedValue(baseData) } as unknown as Request;
    const res = await POST(req);

    expect(res.status).toBe(201);
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: true, data: null, error: null },
      { status: 201 }
    );
  });
});
