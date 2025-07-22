"use client";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ServerIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { assignServers } from "./handlers/assignServers";
import { useState } from "react";
import { AssignServersPopoverProps } from "./AssignServerPopover.types";
import { useServerAssignment } from "./useAssignServerPopover";

export function AssignServersPopover({
  userId,
  editorId,
  onAssigned,
}: AssignServersPopoverProps) {
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="bg-gray-app-200 hover:bg-gray-app-300"
        >
          <ServerIcon className="w-4 h-4 mr-1" />
          Servidores
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-4">
        <h3 className="mb-2 font-semibold text-lg">Asignar servidores</h3>
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
        <Button
          onClick={handleSave}
          size="sm"
          className="mt-3 w-full bg-green-600 hover:bg-green-700"
        >
          Guardar
        </Button>
      </PopoverContent>
    </Popover>
  );
}
