import { render, screen, fireEvent } from "@testing-library/react";
import type { ChangeEventHandler } from "react";
import * as useHasCategoryModule from "@/hooks/useHasCategory";
import Home from "@/app/(home)/page";
jest.mock("@/components/ui/input", () => ({
  Input: ({
    placeholder,
    onChange,
  }: {
    placeholder: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
  }) => (
    <input placeholder={placeholder} onChange={onChange} data-testid="input" />
  ),
}));

jest.mock("@/features/gpu/components", () => ({
  GpuReservationsList: jest.fn(() => <div>GpuReservationsList Mock</div>),
}));

jest.mock("@/features/server/components", () => ({
  CreateServerDialog: jest.fn(() => <div>CreateServerDialog Mock</div>),
  ServerList: jest.fn(() => <div>ServerList Mock</div>),
}));

jest.mock("@/hooks/useHasCategory", () => ({
  useHasCategory: jest.fn(),
}));

const mockUseHasCategory = useHasCategoryModule.useHasCategory as jest.Mock;

describe("Home Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders page with admin privileges", () => {
    mockUseHasCategory.mockReturnValue({ hasCategory: true });

    render(<Home />);

    expect(screen.getByText(/CreateServerDialog Mock/i)).toBeInTheDocument();
    expect(screen.getByText(/GpuReservationsList Mock/i)).toBeInTheDocument();
    expect(screen.getByText(/ServerList Mock/i)).toBeInTheDocument();
  });

  it("renders page without admin privileges", () => {
    mockUseHasCategory.mockReturnValue({ hasCategory: false });

    render(<Home />);

    expect(
      screen.queryByText(/CreateServerDialog Mock/i)
    ).not.toBeInTheDocument();
    expect(screen.getByText(/GpuReservationsList Mock/i)).toBeInTheDocument();
    expect(screen.getByText(/ServerList Mock/i)).toBeInTheDocument();
  });

  it("updates search inputs", () => {
    mockUseHasCategory.mockReturnValue({ hasCategory: true });
    render(<Home />);

    const inputs = screen.getAllByTestId("input");
    fireEvent.change(inputs[0], { target: { value: "gpu" } });
    fireEvent.change(inputs[1], { target: { value: "server" } });

    expect(inputs[0]).toHaveValue("gpu");
    expect(inputs[1]).toHaveValue("server");
  });
});
