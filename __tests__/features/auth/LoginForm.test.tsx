import React, { act } from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  renderHook,
} from "@testing-library/react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import { LoginForm } from "@/features/auth/components";
import { handleApiError } from "@/lib/services/errors/errors";
import { useLoginForm } from "@/features/auth/components/LoginForm/useLoginForm";

// --- Mocks ---
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => ({ get: jest.fn(() => null) })),
}));

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

jest.mock("axios");
jest.mock("sonner", () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

jest.mock(
  "@/features/auth/components/RecoverPasswordForm/RecoverPasswordForm.tsx",
  () => ({
    RecoverPasswordForm: () => <div>RecoverPasswordForm</div>,
  })
);

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --------------------
  // Render tests
  // --------------------
  describe("Render", () => {
    it("renders email, password and login button", () => {
      render(<LoginForm />);
      expect(
        screen.getByPlaceholderText("app.auth.exampleEmail")
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "app.auth.login" })
      ).toBeInTheDocument();
    });
  });

  // --------------------
  // Positive / valid cases
  // --------------------
  describe("Positive cases", () => {
    it("submits successfully with valid input", async () => {
      const mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
      (axios.get as jest.Mock).mockResolvedValue({
        data: { data: { isActive: true } },
      });
      (signIn as jest.Mock).mockResolvedValue({
        error: null,
        url: "/dashboard",
      });

      render(<LoginForm />);

      fireEvent.change(screen.getByPlaceholderText("app.auth.exampleEmail"), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("••••••••"), {
        target: { value: "123456" },
      });

      fireEvent.click(screen.getByRole("button", { name: "app.auth.login" }));

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith("credentials", {
          email: "test@example.com",
          password: "123456",
          redirect: false,
          callbackUrl: "/",
        });
        expect(toast.success).toHaveBeenCalledWith("app.auth.successLogin");
        expect(mockPush).toHaveBeenCalledWith("/dashboard");
      });
    });

    it("handles extremely long email and password", async () => {
      const mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
      (axios.get as jest.Mock).mockResolvedValue({
        data: { data: { isActive: true } },
      });
      (signIn as jest.Mock).mockResolvedValue({
        error: null,
        url: "/dashboard",
      });

      const longEmail = "a".repeat(300) + "@example.com";
      const longPassword = "1".repeat(300);

      render(<LoginForm />);
      fireEvent.change(screen.getByPlaceholderText("app.auth.exampleEmail"), {
        target: { value: longEmail },
      });
      fireEvent.change(screen.getByPlaceholderText("••••••••"), {
        target: { value: longPassword },
      });

      fireEvent.click(screen.getByRole("button", { name: "app.auth.login" }));

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith("credentials", {
          email: longEmail,
          password: longPassword,
          redirect: false,
          callbackUrl: "/",
        });
      });
    });

    it("defaults to '/' if no callbackUrl", async () => {
      const mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
      (axios.get as jest.Mock).mockResolvedValue({
        data: { data: { isActive: true } },
      });
      (signIn as jest.Mock).mockResolvedValue({
        error: null,
        url: "/dashboard",
      });

      const { result } = renderHook(() => useLoginForm());

      await act(async () => {
        await result.current.onSubmit({
          email: "test@example.com",
          password: "123456",
        });
      });

      expect(signIn).toHaveBeenCalledWith(
        "credentials",
        expect.objectContaining({
          callbackUrl: "/",
        })
      );
    });
  });

  // --------------------
  // Negative / error cases
  // --------------------
  describe("Negative cases", () => {
    it("shows schema validation errors for empty fields", async () => {
      render(<LoginForm />);
      fireEvent.click(screen.getByRole("button", { name: "app.auth.login" }));

      expect(
        await screen.findByText("Auth.Schema.emailInvalid")
      ).toBeInTheDocument();
      expect(
        await screen.findByText("Auth.Schema.passwordTooShort")
      ).toBeInTheDocument();
    });

    it("shows error for invalid email format", async () => {
      render(<LoginForm />);
      fireEvent.change(screen.getByPlaceholderText("app.auth.exampleEmail"), {
        target: { value: "invalid-email" },
      });
      fireEvent.change(screen.getByPlaceholderText("••••••••"), {
        target: { value: "123456" },
      });

      fireEvent.click(screen.getByRole("button", { name: "app.auth.login" }));

      expect(
        await screen.findByText("Auth.Schema.emailInvalid")
      ).toBeInTheDocument();
    });

    it("shows error for too short password", async () => {
      render(<LoginForm />);
      fireEvent.change(screen.getByPlaceholderText("app.auth.exampleEmail"), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("••••••••"), {
        target: { value: "123" },
      });

      fireEvent.click(screen.getByRole("button", { name: "app.auth.login" }));

      expect(
        await screen.findByText("Auth.Schema.passwordTooShort")
      ).toBeInTheDocument();
    });

    it("shows error if user is inactive", async () => {
      (axios.get as jest.Mock).mockResolvedValue({
        data: { data: { isActive: false } },
      });

      render(<LoginForm />);
      fireEvent.change(screen.getByPlaceholderText("app.auth.exampleEmail"), {
        target: { value: "inactive@example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("••••••••"), {
        target: { value: "123456" },
      });

      fireEvent.click(screen.getByRole("button", { name: "app.auth.login" }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("app.auth.userInactive");
      });
    });

    it("shows error for invalid credentials", async () => {
      const mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
      (axios.get as jest.Mock).mockResolvedValue({
        data: { data: { isActive: true } },
      });
      (signIn as jest.Mock).mockResolvedValue({ error: "Invalid credentials" });

      render(<LoginForm />);
      fireEvent.change(screen.getByPlaceholderText("app.auth.exampleEmail"), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("••••••••"), {
        target: { value: "123456" },
      });

      fireEvent.click(screen.getByRole("button", { name: "app.auth.login" }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("app.auth.invalidCredentials");
        expect(mockPush).not.toHaveBeenCalled();
      });
    });

    it("handles API errors gracefully", async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error("Network Error"));

      render(<LoginForm />);
      fireEvent.change(screen.getByPlaceholderText("app.auth.exampleEmail"), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("••••••••"), {
        target: { value: "123456" },
      });

      fireEvent.click(screen.getByRole("button", { name: "app.auth.login" }));

      await waitFor(() => {
        expect(handleApiError).toHaveBeenCalled();
      });
    });

    it("calls toast.error when form values are invalid", async () => {
      const { result } = renderHook(() => useLoginForm());

      await act(async () => {
        await result.current.onSubmit({
          email: "invalid-email",
          password: "123",
        });
      });

      expect(toast.error).toHaveBeenCalledWith("app.auth.invalidValues");
    });
  });
});
