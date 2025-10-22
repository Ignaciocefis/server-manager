import { render, screen } from "@testing-library/react";
import { useHasCategory } from "@/hooks/useHasCategory";
import Page from "@/app/(home)/users-management/page";

jest.mock("@/hooks/useHasCategory", () => ({
  useHasCategory: jest.fn(),
}));

jest.mock("@/features/user/components", () => ({
  __esModule: true,
  UserManagementContainer: jest.fn(({ isAdmin }) => (
    <div>UserManagementContainer Mock - isAdmin: {String(isAdmin)}</div>
  )),
}));

const mockUseHasCategory = useHasCategory as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("User Management Page", () => {
  it("renders UserManagementContainer with isAdmin=true", () => {
    mockUseHasCategory.mockReturnValue({ hasCategory: true });

    render(<Page />);

    expect(
      screen.getByText(/UserManagementContainer Mock - isAdmin: true/i)
    ).toBeInTheDocument();
  });

  it("renders UserManagementContainer with isAdmin=false", () => {
    mockUseHasCategory.mockReturnValue({ hasCategory: false });

    render(<Page />);

    expect(
      screen.getByText(/UserManagementContainer Mock - isAdmin: false/i)
    ).toBeInTheDocument();
  });
});
