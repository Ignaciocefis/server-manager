export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: string | unknown;
};
