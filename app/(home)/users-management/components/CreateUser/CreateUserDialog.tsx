"use client";

import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { CreateUserForm } from "./CreateUserForm";

export function CreateUserDialog() {
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
        <CreateUserForm closeDialog={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
