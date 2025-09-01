"use client";

import { PageTitle } from "@/components/Shared";
import { LogsTable } from "..";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { Download } from "lucide-react";

export function LogsContainer({ isAdmin }: { isAdmin: boolean }) {
  const logsRef = useRef<React.ElementRef<typeof LogsTable>>(null);

  return (
    <div className="flex flex-col w-11/12 mx-auto space-y-8">
      <PageTitle title="Registros">
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (logsRef.current) {
                logsRef.current.exportFilteredLogs();
              }
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar datos
          </Button>
        )}
      </PageTitle>

      <LogsTable ref={logsRef} />
    </div>
  );
}
