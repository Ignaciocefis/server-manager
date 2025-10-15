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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AssignResearcherDialog({
  userId,
  onAssigned,
  researcherId,
}: AssignResearcherPopoverProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(researcherId || "");
  const [pendingSelection, setPendingSelection] = useState(researcherId || "");
  const [loading, setLoading] = useState(false);

  const researchers = useResearchers(open);
  const { t } = useLanguage();

  const handleAssign = async () => {
    try {
      setLoading(true);
      await assignResearcher({
        userId,
        researcherId: pendingSelection,
        onSuccess: () => {
          onAssigned(pendingSelection);
          setSelected(pendingSelection);
          setOpen(false);
          toast.success(t("User.management.researcherAssignedSuccess"));
        },
      });
    } catch (error) {
      console.error("Error assigning researcher:", error);
      toast.error(t("User.management.researcherAssignedError"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPendingSelection(selected); // Restaurar selección previa
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gray-app-100 text-gray-app-600 font-bold hover:bg-gray-app-200 shadow-md cursor-pointer">
          <Paperclip className="w-4 h-4 mr-1" />
          {t("User.management.assignResearcher")}
        </Button>
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

        <div className="flex flex-col gap-4">
          <ComboboxResearchers
            value={pendingSelection}
            onChange={(val: string) => setPendingSelection(val)}
            researchers={researchers}
          />

          <div className="flex justify-center gap-4 mt-4">
            <Button
              className="bg-green-app-100 text-gray-app-600 font-bold hover:bg-green-app shadow-md cursor-pointer w-40"
              onClick={handleAssign}
              disabled={
                loading || !pendingSelection || pendingSelection === selected
              }
            >
              {loading
                ? t("User.management.saving")
                : t("User.management.saveChanges")}
            </Button>
            <Button
              className="bg-red-app-100 text-gray-app-600 font-bold hover:bg-red-app shadow-md cursor-pointer w-40"
              onClick={handleCancel}
              disabled={loading}
            >
              {t("User.management.cancelButton")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
