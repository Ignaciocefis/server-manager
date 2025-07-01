"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Server } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { CreateServerForm } from "./CreateServerForm";

export function CreateServerDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex gap-2 items-center">
          <Plus />
          Añadir nuevo servidor
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="md:col-span-2 flex justify-end pr-6 gap-2 items-center">
            <Server className="w-6 h-6" />
            <span className="text-2xl font-semibold text-right">
              Añadir nuevo servidor
            </span>
          </DialogTitle>
        </DialogHeader>
        <CreateServerForm closeDialog={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
