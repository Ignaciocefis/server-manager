"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminLinks, userLinks } from "./AppSidebar.data";
import { LogOut } from "lucide-react";

export function AppSidebar() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { state } = useSidebar();
  const pathName = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-gray-app-600 text-gray-app-100 flex flex-col justify-between">
        <div>
          <SidebarHeader className="flex flex-col items-center pt-5">
            <Link href="/">
              <Image
                src="/logo-minerva.png"
                alt="Logo Minerva"
                width={100}
                height={45}
                className="object-contain mx-auto"
              />
            </Link>
          </SidebarHeader>
          <hr className="bg-gray-app-600 w-4/5 mx-auto mt-4" />
          <SidebarGroup>
            <SidebarMenu className="pl-4">
              {userLinks.map((link) => (
                <SidebarMenuItem key={link.name}>
                  <div className="grid grid-cols-[2rem_auto] items-center">
                    <SidebarMenuButton
                      className={`flex items-center gap-2 w-56 -ml-2 peer ${
                        pathName === link.href
                          ? "bg-gray-app-300 transition-colors"
                          : ""
                      } `}
                    >
                      <link.icon className="mr-2 w-5 h-5" />
                      <Link href={link.href}>{link.name}</Link>
                    </SidebarMenuButton>
                    <div
                      className={` ${
                        pathName === link.href
                          ? "bg-gray-app-300 rounded-md w-8 h-8 -ml-20 transition-colors peer-hover:bg-white"
                          : "opacity-0"
                      } `}
                    />
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <hr className="bg-gray-app-600 w-4/5 mx-auto" />
          <SidebarGroup>
            <SidebarMenu className="pl-4">
              {adminLinks.map((link) => (
                <SidebarMenuItem key={link.name}>
                  <div className="grid grid-cols-[2rem_auto] items-center">
                    <SidebarMenuButton
                      className={`flex items-center gap-2 w-56 -ml-2 peer ${
                        pathName === link.href
                          ? "bg-gray-app-300 transition-colors"
                          : ""
                      } `}
                    >
                      <link.icon className="mr-2 w-5 h-5" />
                      <Link href={link.href}>{link.name}</Link>
                    </SidebarMenuButton>
                    <div
                      className={` ${
                        pathName === link.href
                          ? "bg-gray-app-300 rounded-md w-8 h-8 -ml-20 transition-colors peer-hover:bg-white"
                          : "opacity-0"
                      } `}
                    />
                  </div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </div>
        <div className="mt-auto">
          <hr className="bg-gray-app-600 w-4/5 mx-auto" />
          <SidebarGroup>
            <SidebarMenu className="pl-4 gap-2 w-60 -ml-2">
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Image
                    src="/languages/es.png"
                    alt="Español"
                    width={18}
                    height={18}
                    className="mr-2"
                  />
                  <Link href="/language">Español</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <LogOut className="mr-2 w-6 h-6" />
                  <Link href="/settings">Cerrar sesión</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
