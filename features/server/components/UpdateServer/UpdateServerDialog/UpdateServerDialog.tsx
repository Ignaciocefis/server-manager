"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Settings, Server } from "lucide-react";
import { UpdateServerForm } from "../UpdateServerForm/UpdateServerForm";
import { UpdateServerDialogProps } from "./UpdateServerDialog.types";
import { useLanguage } from "@/hooks/useLanguage";

export function UpdateServerDialog({
  serverToEdit,
  onUpdate,
}: UpdateServerDialogProps) {
  const [open, setOpen] = useState(false);

  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full max-w-xs bg-blue-app-100 text-gray-app-600 font-bold hover:bg-blue-app shadow-md cursor-pointer">
          <Settings size={20} />
          {t("Server.Edit.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-4">
            <Server className="w-8 h-8 text-blue-app" />
            <DialogTitle className="text-2xl font-bold">
              {t("Server.Edit.title")}
            </DialogTitle>
          </div>
          <DialogDescription className="md:ml-12 -ml-7">
            {t("Server.Edit.description")}
          </DialogDescription>
        </DialogHeader>
        {serverToEdit && (
          <UpdateServerForm
            serverToEdit={serverToEdit}
            closeDialog={() => setOpen(false)}
            onUpdate={onUpdate}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
