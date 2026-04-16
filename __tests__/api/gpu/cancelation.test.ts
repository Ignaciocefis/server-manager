jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}));
jest.mock("@/features/gpu/data");
jest.mock("@/features/eventLog/data");
jest.mock("@/features/server/data");
jest.mock("@/lib/auth/hasCategory");
jest.mock("@/lib/services/language/getServerLanguage");

import { PUT } from "@/app/api/gpu/cancelation/route";
import { cancelGpuReservation, getGpuNameById, getReservationByIdAndUser } from "@/features/gpu/data";
import { createEventLog } from "@/features/eventLog/data";
import { getServersNameById } from "@/features/server/data";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

describe("PUT /api/gpu/cancelation", () => {
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
    (NextResponse.json as jest.Mock).mockImplementation((data: unknown, init?: { status?: number } | undefined) => ({ data, status: init?.status }));
  });

  it("returns 401 if user is not authorized", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: null });

    const req = { json: async () => ({ reservationId: "123" }) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.unauthorized") },
      { status: 401 }
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 if reservationId is missing or invalid", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });

    const req = { json: async () => ({}) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.missingReservationId") },
      { status: 400 }
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 if reservation not found", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    (getReservationByIdAndUser as jest.Mock).mockResolvedValue(null);

    const req = { json: async () => ({ reservationId: "res1" }) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.reservationNotFound") },
      { status: 404 }
    );
    expect(res.status).toBe(404);
  });

  it("returns 409 if reservation already cancelled", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    (getReservationByIdAndUser as jest.Mock).mockResolvedValue({
      data: { status: "CANCELLED" },
    });

    const req = { json: async () => ({ reservationId: "res1" }) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.reservationAlreadyCancelled") },
      { status: 409 }
    );
    expect(res.status).toBe(409);
  });

  it("returns 500 if cancelGpuReservation fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    (getReservationByIdAndUser as jest.Mock).mockResolvedValue({
      data: { status: "ACTIVE", gpuId: "gpu1", serverId: "server1" },
    });
    (cancelGpuReservation as jest.Mock).mockResolvedValue({ success: false });

    const req = { json: async () => ({ reservationId: "res1" }) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.cancelationError") },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 404 if GPU not found", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    (getReservationByIdAndUser as jest.Mock).mockResolvedValue({
      data: { status: "ACTIVE", gpuId: "gpu1", serverId: "server1" },
    });
    (cancelGpuReservation as jest.Mock).mockResolvedValue({ success: true });
    (getGpuNameById as jest.Mock).mockResolvedValue({ success: false });

    const req = { json: async () => ({ reservationId: "res1" }) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.gpuNotFound") },
      { status: 404 }
    );
    expect(res.status).toBe(404);
  });

  it("returns 404 if server name not found", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    (getReservationByIdAndUser as jest.Mock).mockResolvedValue({
      data: { status: "ACTIVE", gpuId: "gpu1", serverId: "server1" },
    });
    (cancelGpuReservation as jest.Mock).mockResolvedValue({ success: true });
    (getGpuNameById as jest.Mock).mockResolvedValue({
      success: true,
      data: { name: "GPU-X" },
    });
    (getServersNameById as jest.Mock).mockResolvedValue({ success: false });

    const req = { json: async () => ({ reservationId: "res1" }) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.serverNotFound") },
      { status: 404 }
    );
    expect(res.status).toBe(404);
  });

  it("returns 500 if event log creation fails", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    (getReservationByIdAndUser as jest.Mock).mockResolvedValue({
      data: { status: "ACTIVE", gpuId: "gpu1", serverId: "server1" },
    });
    (cancelGpuReservation as jest.Mock).mockResolvedValue({ success: true });
    (getGpuNameById as jest.Mock).mockResolvedValue({
      success: true,
      data: { name: "GPU-X" },
    });
    (getServersNameById as jest.Mock).mockResolvedValue({
      success: true,
      data: [{ name: "Server-1" }],
    });
    (createEventLog as jest.Mock).mockResolvedValue({ error: true });

    const req = { json: async () => ({ reservationId: "res1" }) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, data: null, error: mockT("Gpu.Route.eventLogError") },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });

  it("returns 200 if reservation cancelled successfully", async () => {
    (hasCategory as jest.Mock).mockResolvedValue({ userId: "user1" });
    (getReservationByIdAndUser as jest.Mock).mockResolvedValue({
      data: { status: "ACTIVE", gpuId: "gpu1", serverId: "server1" },
    });
    (cancelGpuReservation as jest.Mock).mockResolvedValue({ success: true });
    (getGpuNameById as jest.Mock).mockResolvedValue({
      success: true,
      data: { name: "GPU-X" },
    });
    (getServersNameById as jest.Mock).mockResolvedValue({
      success: true,
      data: [{ name: "Server-1" }],
    });
    (createEventLog as jest.Mock).mockResolvedValue({ success: true });

    const req = { json: async () => ({ reservationId: "res1" }) } as unknown as Request;
    const res = await PUT(req);

    expect(createEventLog).toHaveBeenCalledWith({
      eventType: "RESERVATION_CANCELLED",
      message: "EventLog.logMessage.reservation_cancelled|GPU-X|Server-1",
      reservationId: "res1",
      userId: "user1",
      serverId: "server1",
    });
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: true, data: null, error: null },
      { status: 200 }
    );
    expect(res.status).toBe(200);
  });

  it("returns 500 on unexpected error", async () => {
    (getServerLanguage as jest.Mock).mockRejectedValue(new Error("Boom"));

    const req = { json: async () => ({ reservationId: "res1" }) } as unknown as Request;
    const res = await PUT(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { data: null, success: false, error: "Internal Server Error" },
      { status: 500 }
    );
    expect(res.status).toBe(500);
  });
});
