import { CalendarFold, ChartColumnDecreasing, Logs, PcCase, UserCog } from "lucide-react";

export const userLinks = [
  {
    name: "Listado de servidores",
    href: "/",
    icon: PcCase,
  },
  {
    name: "Calendario",
    href: "/calendar",
    icon: CalendarFold,
  },
  {
    name: "Registros",
    href: "/logs",
    icon: Logs,
  },
];

export const adminLinks = [
  {
    name: "Gestión de usuarios",
    href: "/users-management",
    icon: UserCog,
  },
  {
    name: "Estadísticas",
    href: "/statistics",
    icon: ChartColumnDecreasing,
  },
];