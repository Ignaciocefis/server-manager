import { z } from "zod";
import { createUserSchema } from "@/features/user/schemas";
import { Researcher } from "@/lib/types/user";

export type CreateUserFormProps = {
  closeDialog?: () => void;
  onSuccess?: () => void;
};

export type CreateUserFormData = z.infer<typeof createUserSchema>;

export type UseFetchResearchersResult = {
  researchers: Researcher[];
  loading: boolean;
  error: string | null;
};
