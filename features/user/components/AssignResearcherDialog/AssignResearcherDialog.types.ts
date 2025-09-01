export interface AssignResearcherPopoverProps {
  userId: string;
  onAssigned: (researcherId: string) => void;
  researcherId?: string;
}

export interface AssignResearcherPopoverHandlers {
  userId: string;
  researcherId: string;
  onSuccess: () => void;
  onError?: (error: unknown) => void;
}