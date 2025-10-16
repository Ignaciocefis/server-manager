"use client";

import { LogsTable } from "..";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import { Download, Logs } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export function LogsContainer({ isAdmin }: { isAdmin: boolean }) {
  const logsRef = useRef<React.ElementRef<typeof LogsTable>>(null);

  const { t } = useLanguage();

  return (
    <div className="flex flex-col w-11/12 mx-auto space-y-8">
      <div className="border rounded-xl shadow-md bg-white p-5 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Logs className="w-8 h-8 text-blue-app" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-app-700">
              {t("EventLog.logsTable.title")}
            </h1>
          </div>
          <p className="text-sm md:text-base text-gray-app-500 ml-3 pl-8">
            {t("EventLog.logsTable.description")}
          </p>
        </div>

        {isAdmin && (
          <Button
            className="bg-gray-app-100 text-gray-app-600 font-bold hover:bg-gray-app-200 shadow-md cursor-pointer w-40"
            onClick={() => {
              if (logsRef.current) {
                logsRef.current.exportFilteredLogs();
              }
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            {t("EventLog.logsTable.export")}
          </Button>
        )}
      </div>

      <LogsTable ref={logsRef} />
    </div>
  );
}
