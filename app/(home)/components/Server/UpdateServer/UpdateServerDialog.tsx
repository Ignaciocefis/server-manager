"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Settings, Server } from "lucide-react";
import { UpdateServerForm } from "./UpdateServerForm";
import { UpdateServerDialogProps } from "./UpdateServerDialog.types";

export function UpdateServerDialog({
  serverToEdit,
  onUpdate,
}: UpdateServerDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full max-w-xs mx-auto md:mx-0 bg-blue-500 opacity-60 hover:bg-blue-500 hover:opacity-100 text-white">
          <Settings size={20} />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Server className="w-6 h-6" />
            <span className="text-2xl font-semibold">Editar servidor</span>
          </DialogTitle>
        </DialogHeader>
        <UpdateServerForm
          closeDialog={() => setOpen(false)}
          onUpdate={onUpdate}
          serverToEdit={serverToEdit}
        />
      </DialogContent>
    </Dialog>
  );
}
