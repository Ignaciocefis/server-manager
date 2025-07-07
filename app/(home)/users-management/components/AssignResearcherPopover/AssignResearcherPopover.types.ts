export interface AssignResearcherPopoverProps {
  userId: string;
  onAssigned: (researcherId: string) => void;
  researcherId?: string;
}