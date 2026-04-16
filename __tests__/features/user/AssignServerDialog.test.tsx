/* eslint-disable @typescript-eslint/no-explicit-any */

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock(
  "@/features/user/components/AssignServerDialog/useAssignServerDialog",
  () => ({
    useServerAssignment: jest.fn(),
  })
);
jest.mock(
  "@/features/user/components/AssignServerDialog/handlers/fetchServers",
  () => ({
    fetchServers: jest.fn(),
  })
);
jest.mock(
  "@/features/user/components/AssignServerDialog/handlers/assignServers",
  () => ({
    assignServers: jest.fn(),
  })
);

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { useServerAssignment } from "@/features/user/components/AssignServerDialog/useAssignServerDialog";
import { assignServers } from "@/features/user/components/AssignServerDialog/handlers/assignServers";
import { AssignServersDialog } from "@/features/user/components";

describe("AssignServerDialog.tsx", () => {
  const mockUseServerAssignment = useServerAssignment as jest.MockedFunction<
    typeof useServerAssignment
  >;

  const mockAssignServers = assignServers as jest.MockedFunction<
    typeof assignServers
  >;

  const mockOnAssigned = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseServerAssignment.mockReturnValue({
      selected: [],
      setSelected: jest.fn(),
      search: "",
      setSearch: jest.fn(),
      loading: false,
      filteredServers: [],
      toggleServer: jest.fn(),
    });
  });

  describe("Render tests", () => {
    it("renders the dialog trigger button", () => {
      render(
        <AssignServersDialog
          userId="u1"
          editorId="e1"
          onAssigned={mockOnAssigned}
        />
      );

      const button = screen.getByText("User.management.assignServers");
      expect(button).toBeInTheDocument();
    });
  });

  describe("Positive cases", () => {
    it("calls assignServers successfully and closes dialog", async () => {
      mockUseServerAssignment.mockImplementation((isOpen: boolean) => {
        if (isOpen) {
          return {
            selected: ["s1"],
            setSelected: jest.fn(),
            search: "",
            setSearch: jest.fn(),
            loading: false,
            filteredServers: [],
            toggleServer: jest.fn(),
          };
        }
        return {
          selected: [],
          setSelected: jest.fn(),
          search: "",
          setSearch: jest.fn(),
          loading: false,
          filteredServers: [],
          toggleServer: jest.fn(),
        };
      });

      mockAssignServers.mockImplementationOnce(async (params: any) => {
        params?.onSuccess?.();
        return undefined;
      });

      render(
        <AssignServersDialog
          userId="u1"
          editorId="e1"
          onAssigned={mockOnAssigned}
        />
      );

      const trigger = screen.getByText("User.management.assignServers");
      fireEvent.click(trigger);

      const saveButton = screen.getByText("User.management.saveChanges");
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockAssignServers).toHaveBeenCalledWith({
          userId: "u1",
          serverIds: ["s1"],
          onSuccess: expect.any(Function),
        });
        expect(toast.success).toHaveBeenCalledWith(
          "User.management.serversAssignedSuccess"
        );
        expect(mockOnAssigned).toHaveBeenCalled();
      });
    });
  });

  describe("Negative cases", () => {
    it("shows error toast when assignServers throws error", async () => {
      mockUseServerAssignment.mockImplementation((isOpen: boolean) => {
        if (isOpen) {
          return {
            selected: ["s1"],
            setSelected: jest.fn(),
            search: "",
            setSearch: jest.fn(),
            loading: false,
            filteredServers: [],
            toggleServer: jest.fn(),
          };
        }
        return {
          selected: [],
          setSelected: jest.fn(),
          search: "",
          setSearch: jest.fn(),
          loading: false,
          filteredServers: [],
          toggleServer: jest.fn(),
        };
      });

      mockAssignServers.mockRejectedValueOnce(new Error("Network error"));

      render(
        <AssignServersDialog
          userId="u1"
          editorId="e1"
          onAssigned={mockOnAssigned}
        />
      );

      const trigger = screen.getByText("User.management.assignServers");
      fireEvent.click(trigger);

      const saveButton = screen.getByText("User.management.saveChanges");
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });

    it("disables save button when no servers selected", () => {
      render(
        <AssignServersDialog
          userId="u1"
          editorId="e1"
          onAssigned={mockOnAssigned}
        />
      );

      const trigger = screen.getByText("User.management.assignServers");
      fireEvent.click(trigger);

      const saveButton = screen.getByText("User.management.saveChanges");
      expect(saveButton).toBeDisabled();
    });
  });
});
