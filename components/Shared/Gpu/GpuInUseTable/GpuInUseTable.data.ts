import { ServerListItem } from "@/app/(home)/components/Server/ServerList/ServerList.types";
import { ColumnDef } from "@tanstack/react-table";
import { GpuInUseTableRow } from "./GpuInUseTable.data.types";

export const mapReservationsFromServer = (
  server: ServerListItem
): GpuInUseTableRow[] => {
  const rows: GpuInUseTableRow[] = [];

  server.reservations?.forEach((res) => {
    if (res.status === "ACTIVE" || res.status === "EXTENDED") {
      rows.push({
        gpuName: res.gpu?.name ?? "-",
        userFullName: `${res.user.name} ${res.user.firstSurname} ${res.user.secondSurname ?? ""}`,
        startTime: res.startTime,
        endTime: res.extendedUntil ?? res.endTime ?? null,
        status: res.status,
      });
    } 
  });

  return rows;
};

export const gpuInUseColumns: ColumnDef<GpuInUseTableRow>[] = [
  {
    accessorKey: "gpuName",
    header: "Tarjeta gráfica",
  },
  {
    accessorKey: "userFullName",
    header: "Usuario",
  },
  {
    accessorKey: "startTime",
    header: "Inicio",
    cell: ({ getValue }) =>
      new Date(getValue<string>()).toLocaleString("es-ES"),
  },
  {
    accessorKey: "endTime",
    header: "Fin",
    cell: ({ getValue }) => {
      const val = getValue<string | null>();
      return val ? new Date(val).toLocaleString("es-ES") : "-";
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ getValue }) => {
      const val = getValue<string>();
      return val === "EXTENDED" ? "Extendida" : "Activa";
    },
  },
];