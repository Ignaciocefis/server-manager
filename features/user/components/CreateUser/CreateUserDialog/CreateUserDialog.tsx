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
import { User, UserPlus2 } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { CreateUserForm } from "../..";
import { useLanguage } from "@/hooks/useLanguage";

export function CreateUserDialog({
  onUserCreated,
}: {
  onUserCreated: () => void;
}) {
  const [open, setOpen] = useState(false);

  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gray-app-100 text-gray-app-600 font-bold hover:bg-gray-app-200 shadow-md cursor-pointer w-auto">
          <User />
          {t("User.management.addUserButton")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-4">
            <UserPlus2 className="w-8 h-8 text-blue-app" />
            <DialogTitle className="text-2xl font-bold">
              {t("User.management.addUserButton")}
            </DialogTitle>
          </div>
          <DialogDescription className="md:ml-13 -ml-33">
            {t("User.management.addUserDescription")}
          </DialogDescription>
        </DialogHeader>
        <CreateUserForm
          closeDialog={() => setOpen(false)}
          onSuccess={onUserCreated}
        />
      </DialogContent>
    </Dialog>
  );
}
