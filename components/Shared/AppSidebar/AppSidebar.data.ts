import { CalendarFold, ChartColumnDecreasing, Logs, PcCase, UserCog } from "lucide-react";

export const userLinks = [
  {
    name: "Shared.AppSidebar.serverList",
    href: "/",
    icon: PcCase,
  },
  {
    name: "Shared.AppSidebar.calendar",
    href: "/calendar",
    icon: CalendarFold,
  },
  {
    name: "Shared.AppSidebar.logs",
    href: "/logs",
    icon: Logs,
  },
];

export const adminLinks = [
  {
    name: "Shared.AppSidebar.userManagement",
    href: "/users-management",
    icon: UserCog,
  },
  {
    name: "Shared.AppSidebar.statistics",
    href: "/statistics",
    icon: ChartColumnDecreasing,
  },
];