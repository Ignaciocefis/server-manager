export interface ComboboxResearchersProps {
  value: string;
  onChange: (value: string) => void;
  researchers: Researcher[];
}

export type Researcher = {
  id: string;
  name: string;
  firstSurname: string;
  secondSurname?: string;
};