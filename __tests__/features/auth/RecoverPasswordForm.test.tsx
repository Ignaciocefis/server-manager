import React, { act } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { toast } from "sonner";
import { RecoverPasswordForm } from "@/features/auth/components";

// --- Mocks ---
jest.mock("axios");
jest.mock("sonner", () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

describe("RecoverPasswordForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --------------------
  // Render tests
  // --------------------
  describe("Render", () => {
    it("renders trigger and opens dialog", () => {
      render(<RecoverPasswordForm />);
      const trigger = screen.getByText("Auth.RecoverPassword.forgotPassword");
      expect(trigger).toBeInTheDocument();

      fireEvent.click(trigger);
      expect(
        screen.getByPlaceholderText("Auth.RecoverPassword.exampleEmail")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", {
          name: "Auth.RecoverPassword.sendRecoveryEmail",
        })
      ).toBeInTheDocument();
    });
  });

  // --------------------
  // Positive / valid cases
  // --------------------
  describe("Positive cases", () => {
    it("submits successfully with valid email", async () => {
      (axios.post as jest.Mock).mockResolvedValue({});

      render(<RecoverPasswordForm />);
      fireEvent.click(screen.getByText("Auth.RecoverPassword.forgotPassword"));

      fireEvent.change(
        screen.getByPlaceholderText("Auth.RecoverPassword.exampleEmail"),
        {
          target: { value: "test@example.com" },
        }
      );
      fireEvent.click(
        screen.getByRole("button", {
          name: "Auth.RecoverPassword.sendRecoveryEmail",
        })
      );

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith("/api/auth/changePassword", {
          email: "test@example.com",
        });
        expect(toast.success).toHaveBeenCalledWith(
          "Auth.RecoverPassword.recoverySuccess"
        );
      });
    });

    it("handles extremely long email", async () => {
      const longEmail = "a".repeat(300) + "@example.com";
      (axios.post as jest.Mock).mockResolvedValue({});

      render(<RecoverPasswordForm />);
      fireEvent.click(screen.getByText("Auth.RecoverPassword.forgotPassword"));
      fireEvent.change(
        screen.getByPlaceholderText("Auth.RecoverPassword.exampleEmail"),
        {
          target: { value: longEmail },
        }
      );
      fireEvent.click(
        screen.getByRole("button", {
          name: "Auth.RecoverPassword.sendRecoveryEmail",
        })
      );

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith("/api/auth/changePassword", {
          email: longEmail,
        });
        expect(toast.success).toHaveBeenCalledWith(
          "Auth.RecoverPassword.recoverySuccess"
        );
      });
    });

    it("disables button while loading", async () => {
      let resolvePromise!: (value?: unknown) => void;
      (axios.post as jest.Mock).mockImplementation(
        () =>
          new Promise((res) => {
            resolvePromise = res;
          })
      );

      render(<RecoverPasswordForm />);
      fireEvent.click(screen.getByText("Auth.RecoverPassword.forgotPassword"));
      fireEvent.change(
        screen.getByPlaceholderText("Auth.RecoverPassword.exampleEmail"),
        {
          target: { value: "test@example.com" },
        }
      );

      fireEvent.click(
        screen.getByRole("button", {
          name: "Auth.RecoverPassword.sendRecoveryEmail",
        })
      );

      await waitFor(() => {
        expect(
          screen.getByRole("button", {
            name: /Auth\.RecoverPassword\.(sendRecoveryEmail|sending)/,
          })
        ).toBeDisabled();
      });

      act(() => resolvePromise({}));
      await waitFor(() => {
        expect(
          screen.getByRole("button", {
            name: /Auth\.RecoverPassword\.(sendRecoveryEmail|sending)/,
          })
        ).not.toBeDisabled();
      });
    });

    it("submits email with special characters", async () => {
      const specialEmail = "user+test.email@example.co.uk";
      (axios.post as jest.Mock).mockResolvedValue({});

      render(<RecoverPasswordForm />);
      fireEvent.click(screen.getByText("Auth.RecoverPassword.forgotPassword"));
      fireEvent.change(
        screen.getByPlaceholderText("Auth.RecoverPassword.exampleEmail"),
        {
          target: { value: specialEmail },
        }
      );
      fireEvent.click(
        screen.getByRole("button", {
          name: "Auth.RecoverPassword.sendRecoveryEmail",
        })
      );

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith("/api/auth/changePassword", {
          email: specialEmail,
        });
        expect(toast.success).toHaveBeenCalledWith(
          "Auth.RecoverPassword.recoverySuccess"
        );
      });
    });

    it("displays loading state on submit and restores after response", async () => {
      let resolvePromise!: (value?: unknown) => void;

      (axios.post as jest.Mock).mockImplementation(
        () =>
          new Promise((res) => {
            resolvePromise = res;
          })
      );

      render(<RecoverPasswordForm />);
      fireEvent.click(screen.getByText("Auth.RecoverPassword.forgotPassword"));

      const input = screen.getByPlaceholderText(
        "Auth.RecoverPassword.exampleEmail"
      );
      const button = screen.getByRole("button", {
        name: /Auth\.RecoverPassword\.sendRecoveryEmail/,
      });

      fireEvent.change(input, { target: { value: "test@example.com" } });
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toBeDisabled();
        expect(button).toHaveTextContent("Auth.RecoverPassword.sending");
      });

      act(() => resolvePromise({}));

      await waitFor(() => {
        expect(button).not.toBeDisabled();
        expect(button).toHaveTextContent(
          "Auth.RecoverPassword.sendRecoveryEmail"
        );
      });
    });
  });

  // --------------------
  // Negative / error cases
  // --------------------
  describe("Negative cases", () => {
    it("shows validation error for invalid email", async () => {
      render(<RecoverPasswordForm />);
      fireEvent.click(screen.getByText("Auth.RecoverPassword.forgotPassword"));

      fireEvent.change(
        screen.getByPlaceholderText("Auth.RecoverPassword.exampleEmail"),
        {
          target: { value: "invalid-email" },
        }
      );
      fireEvent.click(
        screen.getByRole("button", {
          name: "Auth.RecoverPassword.sendRecoveryEmail",
        })
      );

      expect(
        await screen.findByText("El correo no es válido")
      ).toBeInTheDocument();
    });

    it("shows validation error for empty email", async () => {
      render(<RecoverPasswordForm />);
      fireEvent.click(screen.getByText("Auth.RecoverPassword.forgotPassword"));

      fireEvent.change(
        screen.getByPlaceholderText("Auth.RecoverPassword.exampleEmail"),
        {
          target: { value: "" },
        }
      );
      fireEvent.click(
        screen.getByRole("button", {
          name: "Auth.RecoverPassword.sendRecoveryEmail",
        })
      );

      expect(
        await screen.findByText("El correo no es válido")
      ).toBeInTheDocument();
    });

    it("handles API errors gracefully", async () => {
      (axios.post as jest.Mock).mockRejectedValue(new Error("Network Error"));

      render(<RecoverPasswordForm />);
      fireEvent.click(screen.getByText("Auth.RecoverPassword.forgotPassword"));

      fireEvent.change(
        screen.getByPlaceholderText("Auth.RecoverPassword.exampleEmail"),
        {
          target: { value: "test@example.com" },
        }
      );
      fireEvent.click(
        screen.getByRole("button", {
          name: "Auth.RecoverPassword.sendRecoveryEmail",
        })
      );

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          "Auth.RecoverPassword.recoveryError"
        );
      });
    });

    it("allows re-submitting the same email", async () => {
      (axios.post as jest.Mock).mockResolvedValue({});
      render(<RecoverPasswordForm />);
      fireEvent.click(screen.getByText("Auth.RecoverPassword.forgotPassword"));

      const input = screen.getByPlaceholderText(
        "Auth.RecoverPassword.exampleEmail"
      );
      fireEvent.change(input, { target: { value: "test@example.com" } });
      fireEvent.click(
        screen.getByRole("button", {
          name: "Auth.RecoverPassword.sendRecoveryEmail",
        })
      );

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          "Auth.RecoverPassword.recoverySuccess"
        );
      });

      fireEvent.change(input, { target: { value: "test@example.com" } });
      fireEvent.click(
        screen.getByRole("button", {
          name: "Auth.RecoverPassword.sendRecoveryEmail",
        })
      );

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledTimes(2);
      });
    });
  });
});
