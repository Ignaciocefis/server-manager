"use client";

import { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Paperclip } from "lucide-react";
import { AssignResearcherPopoverProps } from "./AssignResearcherPopover.types";
import { ComboboxResearchers } from "@/components/Shared";
import { useResearchers } from "./useAssignResearcherPopover";
import { assignResearcher } from "./AssignResearcherPopover.handlers";

export function AssignResearcherPopover({
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="bg-gray-app-200 hover:bg-gray-app-300"
        >
          <Paperclip className="w-4 h-4 mr-1" />
          Asignar
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full">
        <ComboboxResearchers
          value={selected}
          onChange={handleAssign}
          researchers={researchers}
        />
      </PopoverContent>
    </Popover>
  );
}
