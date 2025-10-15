"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ServerIcon, User } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { assignServers } from "./handlers/assignServers";
import { useState } from "react";
import { AssignServersDialogProps } from "./AssignServerDialog.types";
import { useServerAssignment } from "./useAssignServerDialog";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";

export function AssignServersDialog({
  userId,
  editorId,
  onAssigned,
}: AssignServersDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const { t } = useLanguage();

  const {
    selected,
    search,
    setSearch,
    loading,
    filteredServers,
    toggleServer,
  } = useServerAssignment(open, editorId, userId);

  const handleSave = async () => {
    try {
      setSaving(true);
      await assignServers({
        userId,
        serverIds: selected,
        onSuccess: () => {
          toast.success(t("User.management.serversAssignedSuccess"));
          setOpen(false);
          onAssigned?.();
        },
      });
    } catch (error) {
      console.error("Error assigning servers:", error);
      toast.error(t("User.management.serversAssignedError"));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gray-app-100 text-gray-app-600 font-bold hover:bg-gray-app-200 shadow-md cursor-pointer">
          <ServerIcon className="w-4 h-4 mr-1" />
          {t("User.management.assignServers")}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-4">
            <User className="w-8 h-8 text-blue-app" />
            <DialogTitle className="text-2xl font-bold">
              {t("User.management.assignServers")}
            </DialogTitle>
          </div>
          <DialogDescription className="md:ml-12 -ml-7">
            {t("User.management.assignServersDescription")}
          </DialogDescription>
        </DialogHeader>

        <input
          type="text"
          placeholder={t("User.management.searchServers")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3 w-full rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none"
        />

        <ScrollArea className="h-64">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              {t("User.management.loadingServers")}
            </div>
          ) : filteredServers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {t("User.management.noServers")}
            </div>
          ) : (
            filteredServers.map((server) => (
              <div
                key={server.id}
                className="flex items-center justify-between py-2 px-2 hover:bg-gray-100 rounded-md cursor-pointer"
                onClick={() => toggleServer(server.id)}
              >
                <span className="text-sm font-medium">{server.name}</span>
                <Checkbox checked={selected.includes(server.id)} />
              </div>
            ))
          )}
        </ScrollArea>

        <DialogFooter className="flex justify-end gap-4 mt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-app-100 text-gray-app-600 font-bold hover:bg-green-app shadow-md cursor-pointer w-40"
          >
            {saving
              ? t("User.management.saving")
              : t("User.management.saveChanges")}
          </Button>

          <Button
            onClick={handleCancel}
            disabled={saving}
            className="bg-red-app-100 text-gray-app-600 font-bold hover:bg-red-app shadow-md cursor-pointer w-40"
          >
            {t("User.management.cancelButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
