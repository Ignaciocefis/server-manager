import { render, screen } from "@testing-library/react";
import Page from "@/app/(home)/logs/page";
import * as useHasCategoryModule from "@/hooks/useHasCategory";

jest.mock("@/hooks/useHasCategory", () => ({
  useHasCategory: jest.fn(),
}));

jest.mock("@/features/eventLog/components", () => ({
  __esModule: true,
  LogsContainer: jest.fn(({ isAdmin }) => (
    <div>LogsContainer Mock - isAdmin: {String(isAdmin)}</div>
  )),
}));

const mockUseHasCategory = useHasCategoryModule.useHasCategory as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Logs Page", () => {
  it("Render LogsContainer with isAdmin=true", () => {
    mockUseHasCategory.mockReturnValue({ hasCategory: true });

    render(<Page />);

    expect(
      screen.getByText(/LogsContainer Mock - isAdmin: true/i)
    ).toBeInTheDocument();
  });

  it("Render LogsContainer with isAdmin=false", () => {
    mockUseHasCategory.mockReturnValue({ hasCategory: false });

    render(<Page />);

    expect(
      screen.getByText(/LogsContainer Mock - isAdmin: false/i)
    ).toBeInTheDocument();
  });
});
