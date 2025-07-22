"use client";

import { useEffect, useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Paperclip } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { AssignResearcherPopoverProps } from "./AssignResearcherPopover.types";
import { Researcher } from "@/lib/types/user";
import { ComboboxResearchers } from "@/components/Shared";

export function AssignResearcherPopover({
  userId,
  onAssigned,
  researcherId,
}: AssignResearcherPopoverProps) {
  const [open, setOpen] = useState(false);
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [selected, setSelected] = useState(researcherId || "");

  useEffect(() => {
    if (!open) return;
    axios
      .get("/api/researcher/allResearchers")
      .then((res) => setResearchers(res.data.researchers || []))
      .catch(() => toast.error("Error al cargar investigadores"));
  }, [open]);

  const handleAssign = async (researcherId: string) => {
    try {
      await axios.put("/api/auth/assignResearcher", {
        userId,
        researcherId,
      });

      toast.success("Investigador asignado correctamente");
      onAssigned(researcherId);
      setSelected(researcherId);
      setOpen(false);
    } catch (error) {
      toast.error("No se pudo asignar el investigador");
      console.error("Error al asignar investigador:", error);
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
          <Paperclip className="w-4 h-4 mr-1" />
          Asignar
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full">
        <ComboboxResearchers
          value={selected}
          onChange={handleAssign}
          researchers={researchers}
        />
      </PopoverContent>
    </Popover>
  );
}
