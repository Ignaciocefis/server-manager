"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Paperclip, User } from "lucide-react";
import { AssignResearcherPopoverProps } from "./AssignResearcherDialog.types";
import { ComboboxResearchers } from "@/components/Shared";
import { useResearchers } from "./useAssignResearcherDialog";
import { assignResearcher } from "./AssignResearcherDialog.handlers";
import { useLanguage } from "@/hooks/useLanguage";

export function AssignResearcherDialog({
  userId,
  onAssigned,
  researcherId,
}: AssignResearcherPopoverProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(researcherId || "");
  const researchers = useResearchers(open);

  const { t } = useLanguage();

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
          {t("User.management.assignResearcher")}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-4">
            <User className="w-8 h-8 text-blue-app" />
            <DialogTitle className="text-2xl font-bold">
              {t("User.management.assignResearcher")}
            </DialogTitle>
          </div>
          <DialogDescription className="md:ml-12 -ml-7">
            {t("User.management.assignResearcherDescription")}
          </DialogDescription>
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
