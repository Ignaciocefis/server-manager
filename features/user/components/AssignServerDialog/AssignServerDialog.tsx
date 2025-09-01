"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ServerIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { assignServers } from "./handlers/assignServers";
import { useState } from "react";
import { AssignServersDialogProps } from "./AssignServerDialog.types";
import { useServerAssignment } from "./useAssignServerDialog";

export function AssignServersDialog({
  userId,
  editorId,
  onAssigned,
}: AssignServersDialogProps) {
  const [open, setOpen] = useState(false);

  const {
    selected,
    search,
    setSearch,
    loading,
    filteredServers,
    toggleServer,
  } = useServerAssignment(open, editorId, userId);

  const handleSave = async () => {
    await assignServers({
      userId,
      serverIds: selected,
      onSuccess: () => {
        setOpen(false);
        onAssigned?.();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-4 px-2 py-1.5 text-sm rounded-sm cursor-pointer select-none focus:text-accent-foreground hover:bg-green-100">
          <ServerIcon className="w-4 h-4" />
          Asignar servidores
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar servidores</DialogTitle>
        </DialogHeader>

        <input
          type="text"
          placeholder="Buscar servidores..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3 w-full rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none"
        />

        <ScrollArea className="h-64">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Cargando...</div>
          ) : filteredServers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No hay servidores disponibles
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

        <DialogFooter>
          <Button
            onClick={handleSave}
            size="sm"
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
