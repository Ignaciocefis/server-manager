"use client";

import { useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ComboboxResearchersProps } from "./ComboboxResearchers.types";

export function ComboboxResearchers({
  value,
  onChange,
  researchers,
}: ComboboxResearchersProps) {
  const [open, setOpen] = useState(false);

  const selectedResearcher = researchers.find((r) => r.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedResearcher
            ? `${selectedResearcher.name} ${selectedResearcher.firstSurname} ${selectedResearcher.secondSurname || ""}`
            : "Selecciona un investigador"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0">
        <Command className="md:min-w-[350px]">
          <CommandInput placeholder="Buscar investigador..." />
          <CommandEmpty>No hay investigadores</CommandEmpty>
          <CommandGroup>
            {researchers.map((researcher) => (
              <CommandItem
                key={researcher.id}
                value={`${researcher.name} ${researcher.firstSurname} ${researcher.secondSurname ?? ""}`}
                onSelect={() => {
                  onChange(researcher.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === researcher.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {researcher.name} {researcher.firstSurname}{" "}
                {researcher.secondSurname ?? ""}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
