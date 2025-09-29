"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationButton } from "..";
import { ProfileSummary } from "@/features/user/components";
import Image from "next/image";
import { useState, useEffect } from "react";

export function Navbar() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-gray-app-100 border-b shadow-lg border-gray-app-300 h-18 flex items-center px-4">
      <div className="flex items-center w-full justify-between">
        <div className="flex items-center gap-2 justify-center">
          <SidebarTrigger className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-200 transition-colors" />

          <Image
            src={isMobile ? "/logo-minerva-short.png" : "/logo-minerva.webp"}
            alt="Logo Minerva"
            width={isMobile ? 45 : 150}
            height={isMobile ? 45 : 90}
            priority
            className={`${isMobile ? "mt-0" : "mt-3"}`}
          />
        </div>

        <div className="flex items-center gap-4">
          <NotificationButton />
          <ProfileSummary />
        </div>
      </div>
    </div>
  );
}
