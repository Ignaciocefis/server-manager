"use client";

import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useLanguage } from "@/hooks/useLanguaje";
import Image from "next/image";

export function LanguageSwitcher() {
  const { changeLanguage, language } = useLanguage();

  const nextLanguage = language === "es" ? "en" : "es";
  const label = nextLanguage === "es" ? "Español" : "English";
  const flagSrc =
    nextLanguage === "es" ? "/languages/es.png" : "/languages/en.png";
  const altText = nextLanguage === "es" ? "Español" : "English";

  return (
    <div className="flex flex-col gap-2">
      <SidebarMenuItem>
        <SidebarMenuButton onClick={() => changeLanguage(nextLanguage)}>
          <Image
            src={flagSrc}
            alt={altText}
            width={18}
            height={18}
            className="mr-2"
          />
          {label}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </div>
  );
}
