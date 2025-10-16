"use client";

import { useLanguage } from "@/hooks/useLanguage";
import Image from "next/image";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { t } = useLanguage();

  return (
    <main>
      <div className="flex w-screen h-screen items-center justify-center -mt-20">
        <div className="flex flex-col items-center gap-4">
          <Image
            src={"/logo-minerva.webp"}
            alt="Logo Minerva"
            width={300}
            height={120}
            priority
          />
          <span className="font-semibold text-gray-app-600 text-center -mt-10">
            {t("app.auth.subtitle")}
          </span>
          <div className="md:w-[480px] w-full mt-10">{children}</div>
        </div>
      </div>
    </main>
  );
}
