"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function LanguageSwitcher() {
  const { changeLanguage, language } = useLanguage();
  const router = useRouter();

  const nextLanguage = language === "es" ? "en" : "es";
  const label = nextLanguage === "es" ? "Español" : "English";
  const flagSrc =
    nextLanguage === "es" ? "/languages/es.png" : "/languages/en.png";
  const altText = nextLanguage === "es" ? "Español" : "English";

  return (
    <Button
      onClick={() => {
        changeLanguage(nextLanguage);
        router.refresh();
      }}
      className="flex items-center justify-baseline shadow-none text-base font-medium cursor-pointer rounded-md -ml-2 gap-3 text-gray-app-600 bg-gray-app-100-transparent transition-colors hover:bg-gray-app-200-transparent"
    >
      <Image src={flagSrc} alt={altText} width={18} height={18} /> {label}
    </Button>
  );
}
