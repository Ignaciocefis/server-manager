"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TriangleAlert } from "lucide-react";

interface ErrorPageProps {
  title: string;
  description: string;
  icon?: ReactNode;
  gifUrl?: string;
}

export function ErrorPage({
  title,
  description,
  icon,
  gifUrl = "/error.gif",
}: ErrorPageProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg max-w-6xl w-full border-2 border-red-app flex flex-row items-center p-10 gap-8">
        <div className="flex-shrink-0">
          <Image
            src={gifUrl}
            alt="Error divertido"
            width={240}
            height={180}
            className="w-48 h-36 md:w-60 md:h-44 rounded-lg shadow-md"
          />
        </div>

        <div className="flex flex-col flex-1 gap-6 items-center text-center">
          <div className="flex flex-row items-center gap-4 justify-center w-full">
            {icon ? icon : <TriangleAlert className="w-16 h-16 text-red-app" />}
            <h1 className="text-4xl md:text-5xl font-extrabold text-red-app text-center">
              {title}
            </h1>
          </div>

          <p className="text-xl md:text-2xl text-red-app">{description}</p>

          <button
            onClick={() => router.push("/")}
            className="mt-4 px-8 py-4 bg-red-app text-white text-lg font-bold rounded-lg hover:bg-red-800 transition"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
