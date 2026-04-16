import React from "react";
import { render, screen } from "@testing-library/react";

import AppLayout from "@/app/(auth)/layout";
import Login from "@/app/(auth)/login/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("UI basic rendering", () => {
  it("renders AppLayout with children correctly", () => {
    render(
      <AppLayout>
        <div>Test Child</div>
      </AppLayout>
    );

    expect(screen.getByText("app.auth.subtitle")).toBeInTheDocument();
    expect(screen.getByAltText("Logo Minerva")).toBeInTheDocument();
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("renders Login page correctly", () => {
    render(<Login />);

    const loginTexts = screen.getAllByText("app.auth.login");
    expect(loginTexts.length).toBeGreaterThan(0);
    expect(screen.getByText("app.auth.credentials")).toBeInTheDocument();
    expect(screen.getByText("app.auth.noAccess")).toBeInTheDocument();
  });
});
