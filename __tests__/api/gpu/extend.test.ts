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

import { PUT } from "@/app/api/gpu/extend/route";
import {
  extendGpuReservation,
  getGpuNameById,
  getOverlappingReservations,
  getReservationByIdAndUser,
} from "@/features/gpu/data";
import { getServersNameById } from "@/features/server/data";
import { createEventLog } from "@/features/eventLog/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

describe("PUT /api/gpu/extend", () => {
  const mockT = jest.fn((key: string) => key);
  const validDate = new Date(Date.now() + 3600 * 1000).toISOString();

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
    (NextResponse.json as jest.Mock).mockImplementation((data: unknown, init?: { status?: number } | undefined) => ({ data, status: init?.status }));
  });

  it("returns 401 if user is unauthorized", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: null });

    const req = { json: async () => ({}) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("User.Route.unauthorized") },
      { status: 401 }
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 if reservationId is missing", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });

    const req = { json: async () => ({ extendedUntil: validDate }) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.missingReservationId") },
      { status: 400 }
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 if extendedUntil is invalid", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });

    const req = { json: async () => ({ reservationId: "res1", extendedUntil: "invalid-date" }) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.invalidExtendedUntil") },
      { status: 400 }
    );
    expect(res.status).toBe(400);
  });

  it("returns 500 if getReservationByIdAndUser fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    (getReservationByIdAndUser as jest.Mock).mockResolvedValue({ success: false });

    const req = { json: async () => ({ reservationId: "res1", extendedUntil: validDate }) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.errorFetchingReservation") },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 404 if reservation not found", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    (getReservationByIdAndUser as jest.Mock).mockResolvedValue({ success: true, data: null });

    const req = { json: async () => ({ reservationId: "res1", extendedUntil: validDate }) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.reservationNotFound") },
      { status: 404 }
    );
    expect(res.status).toBe(404);
  });

  it("returns 400 if reservation cannot be extended (status invalid)", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    (getReservationByIdAndUser as jest.Mock).mockResolvedValue({
      success: true,
      data: { status: "CANCELLED" },
    });

    const req = { json: async () => ({ reservationId: "res1", extendedUntil: validDate }) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.cannotExtendCancelledCompletedOrExtended") },
      { status: 400 }
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 if extendedUntil is before or equal to current end", async () => {
    const pastDate = new Date(Date.now() - 1000).toISOString();
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    (getReservationByIdAndUser as jest.Mock).mockResolvedValue({
      success: true,
      data: { status: "ACTIVE", endDate: new Date(), gpuId: "gpu1", serverId: "server1" },
    });

    const req = { json: async () => ({ reservationId: "res1", extendedUntil: pastDate }) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.extendedUntilMustBeAfterCurrentEnd") },
      { status: 400 }
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 if there is an overlapping reservation", async () => {
    const now = new Date();
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    (getReservationByIdAndUser as jest.Mock).mockResolvedValue({
      success: true,
      data: { status: "ACTIVE", endDate: now, gpuId: "gpu1", serverId: "server1" },
    });
    (getOverlappingReservations as jest.Mock).mockResolvedValue({ success: true, data: true });

    const req = { json: async () => ({ reservationId: "res1", extendedUntil: validDate }) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.extensionOverlapsWithAnotherReservation") },
      { status: 400 }
    );
    expect(res.status).toBe(400);
  });

  it("returns 500 if extendGpuReservation fails", async () => {
    const now = new Date();
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    (getReservationByIdAndUser as jest.Mock).mockResolvedValue({
      success: true,
      data: { status: "ACTIVE", endDate: now, gpuId: "gpu1", serverId: "server1" },
    });
    (getOverlappingReservations as jest.Mock).mockResolvedValue({ success: true, data: false });
    (extendGpuReservation as jest.Mock).mockResolvedValue({ success: false });

    const req = { json: async () => ({ reservationId: "res1", extendedUntil: validDate }) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.errorExtendingReservation") },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 404 if GPU not found", async () => {
    const now = new Date();
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    (getReservationByIdAndUser as jest.Mock).mockResolvedValue({
      success: true,
      data: { status: "ACTIVE", endDate: now, gpuId: "gpu1", serverId: "server1" },
    });
    (getOverlappingReservations as jest.Mock).mockResolvedValue({ success: true, data: false });
    (extendGpuReservation as jest.Mock).mockResolvedValue({ success: true });
    (getGpuNameById as jest.Mock).mockResolvedValue({ success: false });

    const req = { json: async () => ({ reservationId: "res1", extendedUntil: validDate }) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.gpuNotFound") },
      { status: 404 }
    );
    expect(res.status).toBe(404);
  });

  it("returns 404 if server not found", async () => {
    const now = new Date();
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    (getReservationByIdAndUser as jest.Mock).mockResolvedValue({
      success: true,
      data: { status: "ACTIVE", endDate: now, gpuId: "gpu1", serverId: "server1" },
    });
    (getOverlappingReservations as jest.Mock).mockResolvedValue({ success: true, data: false });
    (extendGpuReservation as jest.Mock).mockResolvedValue({ success: true });
    (getGpuNameById as jest.Mock).mockResolvedValue({ success: true, data: { name: "GPU-X" } });
    (getServersNameById as jest.Mock).mockResolvedValue({ success: false });

    const req = { json: async () => ({ reservationId: "res1", extendedUntil: validDate }) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.serverNotFound") },
      { status: 404 }
    );
    expect(res.status).toBe(404);
  });

  it("returns 500 if event log creation fails", async () => {
    const now = new Date();
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    (getReservationByIdAndUser as jest.Mock).mockResolvedValue({
      success: true,
      data: { status: "ACTIVE", endDate: now, gpuId: "gpu1", serverId: "server1" },
    });
    (getOverlappingReservations as jest.Mock).mockResolvedValue({ success: true, data: false });
    (extendGpuReservation as jest.Mock).mockResolvedValue({ success: true });
    (getGpuNameById as jest.Mock).mockResolvedValue({ success: true, data: { name: "GPU-X" } });
    (getServersNameById as jest.Mock).mockResolvedValue({
      success: true,
      data: [{ name: "Server-1" }],
    });
    (createEventLog as jest.Mock).mockResolvedValue({ error: true });

    const req = { json: async () => ({ reservationId: "res1", extendedUntil: validDate, hoursToExtend: 2 }) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.errorCreatingEventLog") },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 200 on successful reservation extension", async () => {
    const now = new Date();
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    (getReservationByIdAndUser as jest.Mock).mockResolvedValue({
      success: true,
      data: { status: "ACTIVE", endDate: now, gpuId: "gpu1", serverId: "server1" },
    });
    (getOverlappingReservations as jest.Mock).mockResolvedValue({ success: true, data: false });
    (extendGpuReservation as jest.Mock).mockResolvedValue({ success: true, data: { ok: true } });
    (getGpuNameById as jest.Mock).mockResolvedValue({ success: true, data: { name: "GPU-X" } });
    (getServersNameById as jest.Mock).mockResolvedValue({
      success: true,
      data: [{ name: "Server-1" }],
    });
    (createEventLog as jest.Mock).mockResolvedValue({ success: true });

    const req = {
      json: async () => ({
        reservationId: "res1",
        extendedUntil: validDate,
        hoursToExtend: 2,
      }),
    } as unknown as Request;
    const res = await PUT(req);

    expect(createEventLog).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "RESERVATION_EXTENDED",
        message: expect.stringContaining("EventLog.logMessage.reservation_extended"),
      })
    );
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: true, data: { success: true, data: { ok: true } }, error: null },
      { status: 200 }
    );
    expect(res.status).toBe(200);
  });

  it("returns 500 on unexpected error", async () => {
    (getServerLanguage as jest.Mock).mockRejectedValue(new Error("Boom"));
    const req = { json: async () => ({ reservationId: "res1", extendedUntil: validDate }) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: "Internal Server Error" },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });
});
