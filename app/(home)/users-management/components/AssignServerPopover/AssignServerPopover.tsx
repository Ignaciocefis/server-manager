"use client";

import { useEffect, useState, useMemo } from "react";
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
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from "@/components/ui/command";
import { AssignServersPopoverProps } from "./AssignServerPopover.types";
import { Server } from "@prisma/client";

export function AssignServersPopover({
  userId,
  editorId,
  onAssigned,
}: AssignServersPopoverProps) {
  const [open, setOpen] = useState(false);
  const [servers, setServers] = useState<Server[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const filteredServers = useMemo(() => {
    return servers.filter((server) =>
      server.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [servers, searchTerm]);

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
        <h3 className="text-base font-semibold mb-2">Asignar servidores</h3>

        <Command className="bg-transparent">
          <CommandInput
            placeholder="Buscar servidor..."
            onValueChange={setSearchTerm}
          />
          <CommandList className="max-h-64 overflow-auto">
            <CommandEmpty>No hay servidores disponibles.</CommandEmpty>

            {filteredServers.map((server) => (
              <CommandItem
                key={server.id}
                onSelect={() => handleToggle(server.id)}
                className="flex items-center justify-between px-2 py-2 rounded-md"
              >
                <span className="text-sm">{server.name}</span>
                <Checkbox
                  checked={selected.includes(server.id)}
                  onClick={(e) => e.preventDefault()}
                />
              </CommandItem>
            ))}
          </CommandList>
        </Command>

        <Button
          onClick={handleSave}
          size="sm"
          disabled={isSaving}
          className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {isSaving ? "Guardando..." : "Guardar"}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
