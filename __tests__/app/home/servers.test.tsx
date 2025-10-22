import Page from "@/app/(home)/servers/[id]/page";
import { render, screen } from "@testing-library/react";
import { useParams } from "next/navigation";

jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

jest.mock("@/features/server/components", () => ({
  __esModule: true,
  ServerDetailsContainer: jest.fn(({ serverId }) => (
    <div>ServerDetailsContainer Mock - serverId: {serverId}</div>
  )),
}));
describe("Server Details Page", () => {
  const mockUseParams = useParams as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders ServerDetailsContainer with the correct serverId", () => {
    mockUseParams.mockReturnValue({ id: "123" });

    render(<Page />);

    expect(
      screen.getByText(/ServerDetailsContainer Mock - serverId: 123/i)
    ).toBeInTheDocument();
  });
});
