import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "../components/Shared/AppSidebar";
import { Navbar } from "@/components/Shared/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gestor de Servidores",
  description: "Gestor de Servidores Minerva Machine Learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-app-0 text-gray-app-600`}
      >
        <SidebarProvider>
          <AppSidebar />
          <div className="w-full flex flex-col min-h-screen">
            <Navbar />
            <main>{children}</main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
