"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Paperclip } from "lucide-react";
import { AssignResearcherPopoverProps } from "./AssignResearcherDialog.types";
import { ComboboxResearchers } from "@/components/Shared";
import { useResearchers } from "./useAssignResearcherDialog";
import { assignResearcher } from "./AssignResearcherDialog.handlers";

export function AssignResearcherDialog({
  userId,
  onAssigned,
  researcherId,
}: AssignResearcherPopoverProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(researcherId || "");
  const researchers = useResearchers(open);

  const handleAssign = (researcherId: string) => {
    assignResearcher({
      userId,
      researcherId,
      onSuccess: () => {
        onAssigned(researcherId);
        setSelected(researcherId);
        setOpen(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-4 px-2 py-1.5 text-sm rounded-sm cursor-pointer select-none focus:text-accent-foreground hover:bg-green-100">
          <Paperclip className="w-4 h-4" />
          Asignar investigador
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Asignar investigador</DialogTitle>
        </DialogHeader>
        <ComboboxResearchers
          value={selected}
          onChange={handleAssign}
          researchers={researchers}
        />
      </DialogContent>
    </Dialog>
  );
}
