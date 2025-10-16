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
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { CreateServerForm } from "../CreateServerForm/CreateServerForm";
import { useLanguage } from "@/hooks/useLanguage";

export function CreateServerDialog() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gray-app-100 text-gray-app-600 font-bold hover:bg-gray-app-200 shadow-md cursor-pointer">
          <Plus />
          {t("Server.CreateServer.addServer")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-4">
            <Server className="w-8 h-8 text-blue-app" />
            <DialogTitle className="text-2xl font-bold">
              {t("Server.CreateServer.addServer")}
            </DialogTitle>
          </div>
          <DialogDescription className="md:ml-12 -ml-7">
            {t("Server.CreateServer.description")}
          </DialogDescription>
        </DialogHeader>
        <CreateServerForm closeDialog={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
