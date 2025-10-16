import { ServerListItem } from "@/features/server/components/ServerList/ServerList.types";
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
        startDate: res.startDate,
        endDate: res.extendedUntil ?? res.endDate ?? null,
        status: res.status,
      });
    }
  });

  return rows;
};

export const gpuInUseColumns = (language: "es" | "en"): ColumnDef<GpuInUseTableRow>[] => {
  const translations = {
    es: {
      status: {
        ACTIVE: "Activo",
        EXTENDED: "Extendido",
      },
    },
    en: {
      status: {
        ACTIVE: "Active",
        EXTENDED: "Extended",
      },
    },
  };

  return [
    {
      accessorKey: "gpuName",
      header: "Server.details.gpuName",
    },
    {
      accessorKey: "userFullName",
      header: "Server.details.userFullName",
    },
    {
      accessorKey: "startDate",
      header: "Server.details.startDate",
      cell: ({ getValue }) => new Date(getValue<string>()).toLocaleString(language === "es" ? "es-ES" : "en-GB"),
    },
    {
      accessorKey: "endDate",
      header: "Server.details.endDate",
      cell: ({ getValue }) => {
        const val = getValue<string | null>();
        return val
          ? new Date(val).toLocaleString(language === "es" ? "es-ES" : "en-GB")
          : "-";
      },
    },
    {
      accessorKey: "status",
      header: "Server.details.status",
      cell: ({ getValue }) => {
        const val = getValue<"ACTIVE" | "EXTENDED">();
        return translations[language].status[val] ?? val;
      },
    },
  ];
};