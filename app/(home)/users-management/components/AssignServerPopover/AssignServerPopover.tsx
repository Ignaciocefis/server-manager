"use client";

import { useEffect, useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ServerIcon } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import { Server } from "@prisma/client";
import { AssignServersPopoverProps } from "./AssignServerPopover.types";

export function AssignServersPopover({
  userId,
  editorId,
  onAssigned,
}: AssignServersPopoverProps) {
  const [open, setOpen] = useState(false);
  const [servers, setServers] = useState<Server[]>([]);
  const [filteredServers, setFilteredServers] = useState<Server[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    const fetchServers = async () => {
      try {
        const [availableRes, assignedRes] = await Promise.all([
          axios.get(`/api/server/list?id=${editorId}`),
          axios.get(`/api/server/list?id=${userId}`),
        ]);

        const available = availableRes.data ?? [];
        const assigned = assignedRes.data ?? [];

        setServers(available);
        setFilteredServers(available);
        setSelected(assigned.map((s: Server) => s.id));
      } catch (error) {
        console.error("Error fetching servers:", error);
      }
    };

    fetchServers();
  }, [open, userId, editorId]);

  const handleToggle = (serverId: string) => {
    setSelected((prev) =>
      prev.includes(serverId)
        ? prev.filter((id) => id !== serverId)
        : [...prev, serverId]
    );
  };

  const handleSearch = (term: string) => {
    const filtered = servers.filter((server) =>
      server.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredServers(filtered);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await axios.put("/api/server/assignServers", {
        userId,
        serverIds: selected,
      });
      toast.success("Servidores asignados correctamente");
      setOpen(false);
      onAssigned?.();
    } catch (error) {
      toast.error("No se pudo asignar los servidores");
      console.error("Error al guardar:", error);
    } finally {
      setIsSaving(false);
    }
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

      <PopoverContent className="w-[320px] p-4 rounded-xl shadow-md">
        <div className="mb-3">
          <h3 className="text-base font-semibold">Asignar servidores</h3>
          <p className="text-sm text-muted-foreground">
            Selecciona los servidores disponibles para este usuario.
          </p>
        </div>

        <Command className="bg-transparent">
          <CommandInput
            placeholder="Buscar servidor..."
            onValueChange={handleSearch}
          />
          <CommandList>
            <ScrollArea className="h-64 pr-2">
              {filteredServers.length === 0 ? (
                <CommandEmpty>No hay servidores disponibles.</CommandEmpty>
              ) : (
                filteredServers.map((server) => (
                  <CommandItem
                    key={server.id}
                    onSelect={() => handleToggle(server.id)}
                    className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted"
                  >
                    <span className="text-sm truncate">{server.name}</span>
                    <Checkbox
                      checked={selected.includes(server.id)}
                      className="pointer-events-none"
                    />
                  </CommandItem>
                ))
              )}
            </ScrollArea>
          </CommandList>
        </Command>

        <Button
          onClick={handleSave}
          size="sm"
          disabled={isSaving}
          className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-medium"
        >
          {isSaving ? "Guardando..." : "Guardar"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
