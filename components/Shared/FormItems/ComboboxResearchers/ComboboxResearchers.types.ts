import { Researcher } from "@/lib/types/user";

export interface ComboboxResearchersProps {
  value: string;
  onChange: (value: string) => void;
  researchers: Researcher[];
}
