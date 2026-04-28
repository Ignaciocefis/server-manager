"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LanguageSwitcher() {
  const { changeLanguage, language } = useLanguage();
  const router = useRouter();

  const [isSwitching, setIsSwitching] = useState(false);

  const currentLanguage = language === "es" ? "Español" : "English";
  const flagSrc = language === "es" ? "/languages/es.png" : "/languages/en.png";
  const altText = currentLanguage;

  const nextLanguage = language === "es" ? "en" : "es";

  const handleLanguageChange = async () => {
    if (isSwitching) return;

    setIsSwitching(true);

    changeLanguage(nextLanguage);
    router.refresh();

    setTimeout(() => {
      setIsSwitching(false);
    }, 1000);
  };

  return (
    <Button
      disabled={isSwitching}
      onClick={handleLanguageChange}
      className="flex items-center justify-baseline shadow-none text-base font-medium cursor-pointer rounded-md -ml-2 gap-3 text-gray-app-600 bg-gray-app-100-transparent transition-colors hover:bg-gray-app-200-transparent disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Image src={flagSrc} alt={altText} width={18} height={18} />
      {currentLanguage}
    </Button>
  );
}
