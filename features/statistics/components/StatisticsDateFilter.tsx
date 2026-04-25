"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import "react-day-picker/dist/style.css";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { useMemo, useState } from "react";

interface StatisticsDateFilterProps {
  startDateValue: string;
  endDateValue: string;
  hasDateFilter: boolean;
  applyFilterLabel: string;
  resetFilterLabel: string;
  filterAppliedLabel: string;
  filterHintLabel: string;
  startDateLabel: string;
  endDateLabel: string;
}

const parseDateInput = (value: string) => {
  if (!value) return undefined;

  const parsedDate = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
};

const formatDateInput = (date?: Date) => {
  if (!date) return "";

  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - timezoneOffset).toISOString().split("T")[0];
};

export function StatisticsDateFilter({
  startDateValue,
  endDateValue,
  hasDateFilter,
  applyFilterLabel,
  resetFilterLabel,
  filterAppliedLabel,
  filterHintLabel,
  startDateLabel,
  endDateLabel,
}: StatisticsDateFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialStartDate = useMemo(
    () => parseDateInput(startDateValue),
    [startDateValue],
  );
  const initialEndDate = useMemo(
    () => parseDateInput(endDateValue),
    [endDateValue],
  );

  const [startDate, setStartDate] = useState<Date | undefined>(
    initialStartDate,
  );
  const [endDate, setEndDate] = useState<Date | undefined>(initialEndDate);
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);

  const hasLocalFilter = Boolean(startDate || endDate || hasDateFilter);

  const applyFilter = () => {
    const params = new URLSearchParams(searchParams.toString());

    const startValue = formatDateInput(startDate);
    const endValue = formatDateInput(endDate);

    if (startValue) {
      params.set("startDate", startValue);
    } else {
      params.delete("startDate");
    }

    if (endValue) {
      params.set("endDate", endValue);
    } else {
      params.delete("endDate");
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const resetFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    router.push(pathname);
  };

  const startDateDisplay = startDate
    ? formatDateInput(startDate)
    : startDateLabel;
  const endDateDisplay = endDate ? formatDateInput(endDate) : endDateLabel;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsStartModalOpen(true)}
          className="justify-start text-left"
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          {startDateDisplay}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsEndModalOpen(true)}
          className="justify-start text-left"
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          {endDateDisplay}
        </Button>
      </div>

      <Dialog open={isStartModalOpen} onOpenChange={setIsStartModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{startDateLabel}</DialogTitle>
            <DialogDescription>{startDateLabel}</DialogDescription>
          </DialogHeader>
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={(date) => {
              setStartDate(date);
              if (date) setIsStartModalOpen(false);
            }}
            className="mx-auto"
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEndModalOpen} onOpenChange={setIsEndModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{endDateLabel}</DialogTitle>
            <DialogDescription>{endDateLabel}</DialogDescription>
          </DialogHeader>
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={(date) => {
              setEndDate(date);
              if (date) setIsEndModalOpen(false);
            }}
            className="mx-auto"
          />
        </DialogContent>
      </Dialog>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={applyFilter}
          className="bg-blue-app hover:bg-blue-app/90"
        >
          {applyFilterLabel}
        </Button>
        {hasLocalFilter ? (
          <Button type="button" variant="outline" onClick={resetFilter}>
            {resetFilterLabel}
          </Button>
        ) : null}
      </div>

      <p className="text-sm text-gray-app-500">
        {hasLocalFilter ? filterAppliedLabel : filterHintLabel}
      </p>
    </div>
  );
}
