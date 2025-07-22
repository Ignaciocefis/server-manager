import { z } from "zod";
import { createUserSchema } from "@/features/user/schemas";
import { Researcher } from "@/components/Shared/FormItems/ComboboxResearchers/ComboboxResearchers.types";

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
