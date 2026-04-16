import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AssignResearcherDialog } from "@/features/user/components";

const userAPI = {
  assignResearcher: jest.fn(),
  fetchResearchers: jest.fn(),
};

// Mocks
jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
  },
}));

jest.mock("@radix-ui/react-select");

describe("AssignResearcherDialog", () => {
  const researchers = [
    { id: "r1", name: "Researcher 1" },
    { id: "r2", name: "Researcher 2" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(userAPI, "fetchResearchers").mockResolvedValue(researchers);
  });

  it("renders trigger button and opens dialog", async () => {
    render(<AssignResearcherDialog userId="u1" onAssigned={jest.fn()} />);
    const trigger = screen.getByRole("button", { name: /assignResearcher/i });
    expect(trigger).toBeInTheDocument();

    fireEvent.click(trigger);

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeVisible();
  });
});
