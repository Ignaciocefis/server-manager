"use client";

import { PageTitle } from "@/components/Shared";
import { LogsTable } from "..";

export function LogsContainer() {
  return (
    <div className="flex flex-col items-center justify-center">
      <PageTitle title="Registros"></PageTitle>

      <LogsTable />
    </div>
  );
}
