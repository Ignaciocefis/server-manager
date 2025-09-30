"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminLinks, userLinks } from "./AppSidebar.data";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { LanguageSwitcher } from "..";
import { useLanguage } from "@/hooks/useLanguage";

export function AppSidebar() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { state } = useSidebar();
  const pathName = usePathname();
  const { t } = useLanguage();

  return (
    <Sidebar
      collapsible="icon"
      className="fixed top-0 left-0 h-full z-40 pt-18"
    >
      <SidebarContent className="bg-gray-app-100 text-gray-app-600 flex flex-col justify-between h-full pt-4">
        <div>
          <SidebarGroup>
            <SidebarMenu className="pl-4">
              {userLinks.map((link) => (
                <SidebarMenuItem key={link.name}>
                  <div className="grid grid-cols-[2rem_auto] items-center">
                    <SidebarMenuButton
                      className={`flex items-center gap-3 w-56 -ml-2 text-base font-medium peer transition-colors ${
                        pathName === link.href
                          ? "bg-gray-app-200-transparent rounded-md hover:bg-gray-app-200-transparent"
                          : "hover:bg-gray-app-200-transparent"
                      }`}
                    >
                      <link.icon className="mr-2 w-5 h-5" />
                      <Link href={link.href}>{t(link.name)}</Link>
                    </SidebarMenuButton>
                    <div
                      className={`${
                        pathName === link.href
                          ? "bg-gray-app-200 rounded-md w-8 h-8 -ml-20 transition-colors peer-hover:bg-gray-app-200-transparent"
                          : "opacity-0"
                      }`}
                    />
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <hr className="border-gray-app-300 w-4/5 mx-auto my-4" />{" "}
          <SidebarGroup>
            <SidebarMenu className="pl-4">
              {adminLinks.map((link) => (
                <SidebarMenuItem key={link.name}>
                  <div className="grid grid-cols-[2rem_auto] items-center">
                    <SidebarMenuButton
                      className={`flex items-center gap-3 w-56 -ml-2 text-base font-medium peer transition-colors ${
                        pathName === link.href
                          ? "bg-gray-app-200-transparent rounded-md hover:bg-gray-app-200-transparent"
                          : "hover:bg-gray-app-200-transparent"
                      }`}
                    >
                      <link.icon className="mr-2 w-5 h-5" />
                      <Link href={link.href}>{t(link.name)}</Link>
                    </SidebarMenuButton>
                    <div
                      className={`${
                        pathName === link.href
                          ? "bg-gray-app-200 rounded-md w-8 h-8 -ml-20 transition-colors peer-hover:bg-gray-app-150"
                          : "opacity-0"
                      }`}
                    />
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </div>

        <div className="mt-auto">
          <hr className="border-gray-app-300 w-4/5 mx-auto my-4" />{" "}
          <SidebarGroup>
            <SidebarMenu className="pl-4 gap-2 w-60 -ml-2">
              <LanguageSwitcher />
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center gap-3 w-56 text-base font-medium peer transition-colors hover:bg-gray-app-200-transparent"
                >
                  <LogOut className="mr-2 w-6 h-6" />
                  <span>{t("Shared.AppSidebar.logout")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
