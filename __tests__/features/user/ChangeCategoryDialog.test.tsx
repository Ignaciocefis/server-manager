import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChangeCategoryDialog } from "@/features/user/components";

jest.mock("axios");
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("ChangeCategoryDialog.tsx", () => {
  const mockOnUpdated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Render tests", () => {
    it("renders the edit category button", () => {
      render(
        <ChangeCategoryDialog
          userId="user-1"
          currentCategory="JUNIOR"
          onUpdated={mockOnUpdated}
        />
      );

      expect(
        screen.getByText("User.management.editCategory")
      ).toBeInTheDocument();
    });

    it("renders the select with current category", async () => {
      render(
        <ChangeCategoryDialog
          userId="user-1"
          currentCategory="ADMIN"
          onUpdated={mockOnUpdated}
        />
      );

      const trigger = screen.getByText("User.management.editCategory");
      fireEvent.click(trigger);
    });
  });
});
