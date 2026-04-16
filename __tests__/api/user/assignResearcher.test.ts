import { PUT } from "@/app/api/user/assignResearcher/route";
import { createEventLog } from "@/features/eventLog/data";
import { assignJuniorToResearcher, getUserNameById, userExistsById } from "@/features/user/data";
import { assignResearcherFormSchema } from "@/features/user/schemas";
import { getFullName } from "@/features/user/utils";
import { hasCategory } from "@/lib/auth/hasCategory";
import { getServerLanguage } from "@/lib/services/language/getServerLanguage";
import { NextResponse } from "next/server";

jest.mock("@/features/eventLog/data");
jest.mock("@/features/user/data");
jest.mock("@/features/user/schemas");
jest.mock("@/features/user/utils");
jest.mock("@/lib/auth/hasCategory");
jest.mock("@/lib/services/language/getServerLanguage");
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({ data, status: init?.status })),
  },
}));

describe("PUT /api/user/assignResearcher", () => {
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerLanguage as jest.Mock).mockResolvedValue({ t: mockT });
    (assignResearcherFormSchema as jest.Mock).mockReturnValue({
      parse: (data: unknown) => data,
    });
    (getFullName as jest.Mock).mockImplementation((first, second, name) => `${name} ${first} ${second}`);
  });

  describe("Positive case", () => {
    it("assigns a junior to a researcher successfully", async () => {
      const request = { json: jest.fn().mockResolvedValue({ userId: "junior1", researcherId: "researcher1" }) } as unknown as Request;

      (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
      (userExistsById as jest.Mock).mockResolvedValue(true);
      (assignJuniorToResearcher as jest.Mock).mockResolvedValue({ success: true });
      (getUserNameById as jest.Mock)
        .mockResolvedValueOnce({ success: true, data: { name: "Junior", firstSurname: "A", secondSurname: "B" } })
        .mockResolvedValueOnce({ success: true, data: { name: "Researcher", firstSurname: "X", secondSurname: "Y" } });
      (createEventLog as jest.Mock).mockResolvedValue({ success: true });

      const res = await PUT(request);

      expect(hasCategory).toHaveBeenCalledWith("ADMIN");
      expect(userExistsById).toHaveBeenCalledTimes(2);
      expect(assignJuniorToResearcher).toHaveBeenCalledWith("junior1", "researcher1");
      expect(getUserNameById).toHaveBeenCalledTimes(2);
      expect(createEventLog).toHaveBeenCalled();
      expect(NextResponse.json).toHaveBeenCalledWith(
        { data: "Investigador asignado correctamente", success: true, error: null },
        { status: 200 }
      );
      expect(res.status).toBe(200);
    });

    it("calls getFullName correctly with user and researcher names", async () => {
      const request = {
        json: jest.fn().mockResolvedValue({ userId: "junior1", researcherId: "researcher1" }),
      } as unknown as Request;

      (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
      (userExistsById as jest.Mock).mockResolvedValue(true);
      (assignJuniorToResearcher as jest.Mock).mockResolvedValue({ success: true });
      (getUserNameById as jest.Mock)
        .mockResolvedValueOnce({ success: true, data: { name: "Junior", firstSurname: "A", secondSurname: "B" } })
        .mockResolvedValueOnce({ success: true, data: { name: "Researcher", firstSurname: "X", secondSurname: "Y" } });
      (createEventLog as jest.Mock).mockResolvedValue({ success: true });

      await PUT(request);

      expect(getFullName).toHaveBeenCalledWith("A", "B", "Junior");
      expect(getFullName).toHaveBeenCalledWith("X", "Y", "Researcher");
    });
  });

  describe("Negative cases", () => {
    it("returns 403 if user is not ADMIN", async () => {
      const request = { json: jest.fn().mockResolvedValue({ userId: "junior1", researcherId: "researcher1" }) } as unknown as Request;
      (hasCategory as jest.Mock).mockResolvedValue({ isCategory: false });

      const res = await PUT(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { data: null, success: false, error: "User.Route.unauthorized" },
        { status: 403 }
      );
      expect(res.status).toBe(403);
    });

    it("returns 404 if junior or researcher does not exist", async () => {
      const request = { json: jest.fn().mockResolvedValue({ userId: "junior1", researcherId: "researcher1" }) } as unknown as Request;
      (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
      (userExistsById as jest.Mock).mockResolvedValue(false);

      const res = await PUT(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { data: null, success: false, error: "User.Route.userNotFound" },
        { status: 404 }
      );
      expect(res.status).toBe(404);
    });

    it("returns 500 if assignJuniorToResearcher fails", async () => {
      const request = { json: jest.fn().mockResolvedValue({ userId: "junior1", researcherId: "researcher1" }) } as unknown as Request;
      (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
      (userExistsById as jest.Mock).mockResolvedValue(true);
      (assignJuniorToResearcher as jest.Mock).mockResolvedValue({ success: false, error: "Error" });

      const res = await PUT(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { data: null, success: false, error: "User.Route.unassignedToResearcher" },
        { status: 500 }
      );
      expect(res.status).toBe(500);
    });

    it("returns 404 if getUserNameById fails", async () => {
      const request = { json: jest.fn().mockResolvedValue({ userId: "junior1", researcherId: "researcher1" }) } as unknown as Request;
      (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
      (userExistsById as jest.Mock).mockResolvedValue(true);
      (assignJuniorToResearcher as jest.Mock).mockResolvedValue({ success: true });
      (getUserNameById as jest.Mock).mockResolvedValue({ success: false, data: null, error: "Not found" });

      const res = await PUT(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { data: null, success: false, error: "User.Route.userNotFound" },
        { status: 404 }
      );
      expect(res.status).toBe(404);
    });

    it("returns 500 if createEventLog fails", async () => {
      const request = { json: jest.fn().mockResolvedValue({ userId: "junior1", researcherId: "researcher1" }) } as unknown as Request;
      (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
      (userExistsById as jest.Mock).mockResolvedValue(true);
      (assignJuniorToResearcher as jest.Mock).mockResolvedValue({ success: true });
      (getUserNameById as jest.Mock)
        .mockResolvedValueOnce({ success: true, data: { name: "Junior", firstSurname: "A", secondSurname: "B" } })
        .mockResolvedValueOnce({ success: true, data: { name: "Researcher", firstSurname: "X", secondSurname: "Y" } });
      (createEventLog as jest.Mock).mockResolvedValue({ error: "Log failed" });

      const res = await PUT(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { data: null, success: false, error: "User.Route.createEventLogError" },
        { status: 500 }
      );
      expect(res.status).toBe(500);
    });

    it("returns 500 if userName has error or data is null", async () => {
      const request = {
        json: jest.fn().mockResolvedValue({ userId: "junior1", researcherId: "researcher1" }),
      } as unknown as Request;

      (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
      (userExistsById as jest.Mock).mockResolvedValue(true);
      (assignJuniorToResearcher as jest.Mock).mockResolvedValue({ success: true });
      (getUserNameById as jest.Mock)
        .mockResolvedValueOnce({ success: false, data: null, error: "Not found" }) // userName falla
        .mockResolvedValueOnce({ success: true, data: { name: "Researcher", firstSurname: "X", secondSurname: "Y" } });

      const res = await PUT(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { data: null, success: false, error: "User.Route.userNotFound" },
        { status: 404 }
      );
      expect(res.status).toBe(404);
    });

    it("returns 500 if researcherName has error or data is null", async () => {
      const request = {
        json: jest.fn().mockResolvedValue({ userId: "junior1", researcherId: "researcher1" }),
      } as unknown as Request;

      (hasCategory as jest.Mock).mockResolvedValue({ isCategory: true });
      (userExistsById as jest.Mock).mockResolvedValue(true);
      (assignJuniorToResearcher as jest.Mock).mockResolvedValue({ success: true });
      (getUserNameById as jest.Mock)
        .mockResolvedValueOnce({ success: true, data: { name: "Junior", firstSurname: "A", secondSurname: "B" } })
        .mockResolvedValueOnce({ success: false, data: null, error: "Not found" }); // researcherName falla

      const res = await PUT(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { data: null, success: false, error: "User.Route.userNotFound" },
        { status: 404 }
      );
      expect(res.status).toBe(404);
    });
  });

  describe("Error handling", () => {
    it("returns 500 on unexpected error", async () => {
      const request = { json: jest.fn().mockRejectedValue(new Error("Unexpected")) } as unknown as Request;

      const res = await PUT(request);

      expect(NextResponse.json).toHaveBeenCalledWith(
        { data: null, success: false, error: "Internal Server Error" },
        { status: 500 }
      );
      expect(res.status).toBe(500);
    });
  });
});
