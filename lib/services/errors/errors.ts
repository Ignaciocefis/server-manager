import axios, { AxiosError } from "axios";
import { toast } from "sonner";

export function handleApiError(error: unknown, showToast: boolean = false): string {
  let message = "Error desconocido";

  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string }>;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    if (data?.error) {
      message = data.error;
    } else {
      message = axiosError.message || "Error en la solicitud";
    }

    if (status === 401) {
      window.location.href = "/login";
    } else if (status === 403) {
      window.location.href = "/unauthorized";
    } else if (status === 404) {
      window.location.href = "/not-found";
    } else if (status && status >= 500) {
      window.location.href = "/error";
    }
  } else if (error instanceof Error) {
    message = error.message || "Error inesperado";
  } else if (typeof error === "string") {
    message = error;
  }

  if (showToast) {
    toast.error(message);
  }

  return message;
}
