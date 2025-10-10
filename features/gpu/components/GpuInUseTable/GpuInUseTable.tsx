"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ServerListItem } from "@/features/server/components/ServerList/ServerList.types";
import {
  gpuInUseColumns,
  mapReservationsFromServer,
} from "./GpuInUseTable.data";
import { useMemo } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { User } from "lucide-react";

export function GpuInUseTable({ data }: { data: ServerListItem }) {
  const tableData = useMemo(() => {
    return mapReservationsFromServer(data);
  }, [data]);

  const { t, language } = useLanguage();

  const table = useReactTable({
    data: tableData,
    columns: gpuInUseColumns(language),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-11/12 border rounded-xl shadow-md bg-white p-5 flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 rounded-lg border border-gray-app-200 shadow-sm bg-white mb-4">
        <div className="flex items-center gap-3">
          <User className="w-6 h-6 text-blue-app" />
          <h2 className="text-xl md:text-2xl font-bold text-gray-app-700">
            {t("Server.details.currentGpuUsers")}
          </h2>
        </div>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead key={header.id} className="text-sm font-semibold">
                  {header.isPlaceholder
                    ? null
                    : t(
                        String(
                          flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )
                        )
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="hover:bg-opacity-20 transition-colors rounded-xl">
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-opacity-20 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.getAllColumns().length}
                className="text-center py-10 text-muted-foreground"
              >
                {t("Server.details.noCurrentGpuUsers")}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
