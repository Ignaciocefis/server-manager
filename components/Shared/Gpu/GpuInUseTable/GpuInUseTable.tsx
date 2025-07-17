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
import { ServerListItem } from "@/app/(home)/components/Server/ServerList/ServerList.types";
import {
  gpuInUseColumns,
  mapReservationsFromServer,
} from "./GpuInUseTable.data";
import { useMemo } from "react";

export function GpuInUseTable({ data }: { data: ServerListItem }) {
  const tableData = useMemo(() => {
    return mapReservationsFromServer(data);
  }, [data]);

  const table = useReactTable({
    data: tableData,
    columns: gpuInUseColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-11/12 mx-auto mt-6 px-8 py-4 rounded-xl border overflow-hidden shadow-sm bg-gray-app-100">
      <h2 className="text-xl font-semibold mb-2">
        Usuarios utilizando GPUs actualmente
      </h2>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead key={header.id} className="text-sm font-semibold">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
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
                colSpan={gpuInUseColumns.length}
                className="text-center py-10 text-muted-foreground"
              >
                No hay usuarios utilizando GPUs actualmente.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
