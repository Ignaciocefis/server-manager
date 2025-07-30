"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { CreateUserForm } from "../..";

export function CreateUserDialog({
  onUserCreated,
}: {
  onUserCreated: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex gap-2 items-center">
          <User />
          Añadir nuevo usuario
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="md:col-span-2 flex justify-end pr-6 gap-2 items-center">
            <User className="w-6 h-6" />
            <span className="text-2xl font-semibold text-right">
              Añadir nuevo usuario
            </span>
          </DialogTitle>
        </DialogHeader>
        <CreateUserForm
          closeDialog={() => setOpen(false)}
          onSuccess={onUserCreated}
        />
      </DialogContent>
    </Dialog>
  );
}
